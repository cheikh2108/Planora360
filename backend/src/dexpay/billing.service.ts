import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingCycle, Payment, SubscriptionPlan } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DexpayService } from './dexpay.service';
import { PLAN_CURRENCY, PLAN_LABELS, PayablePlan, addPeriod, planCatalog, planPrice } from './plan-catalog';

/** Données utiles d'un événement checkout.* (charge utile plate de DexPay). */
export interface CheckoutEvent {
  reference: string;
  amount?: number | string;
  currency?: string;
  payment_method?: string;
  operator?: string;
  transaction_id?: string;
  checkout_session_id?: string;
}

/**
 * Abonnements payants : l'administrateur choisit une formule et un cycle, paie sur DexPay,
 * et la formule est activée à la confirmation du paiement (webhook signé, ou vérification
 * directe auprès de DexPay au retour sur la page de succès).
 *
 * Le montant et la formule appliqués sont ceux enregistrés au départ du paiement, jamais ceux
 * annoncés dans le webhook : un paiement dont le montant diffère n'active rien.
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dexpay: DexpayService,
    private readonly config: ConfigService,
    private readonly cacheInvalidation: CacheInvalidationService,
    private readonly notifications: NotificationsService,
  ) {}

  plans() {
    return { currency: PLAN_CURRENCY, plans: planCatalog(), onlinePayment: this.isOnlinePaymentReady() };
  }

  /** Paiement en ligne possible dès que les clés DexPay sont configurées. */
  isOnlinePaymentReady(): boolean {
    return this.dexpay.isConfigured();
  }

  async subscription(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        billingCycle: true,
        currentPeriodEnd: true,
        nextPaymentDate: true,
        trialEndsAt: true,
      },
    });
    if (!org) throw new NotFoundException('Organisation introuvable');

    const payments = await this.prisma.payment.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        dexpayReference: true, amount: true, currency: true, status: true, plan: true,
        paymentMethod: true, periodStart: true, periodEnd: true, createdAt: true, paidAt: true, metadata: true,
      },
    });

    return {
      ...org,
      onlinePayment: this.isOnlinePaymentReady(),
      payments: payments.map(({ dexpayReference, metadata, ...p }) => ({
        ...p,
        reference: dexpayReference,
        billingCycle: (metadata as any)?.billing_cycle ?? null,
      })),
    };
  }

  /** Démarre le paiement d'une formule : enregistre le paiement en attente et renvoie l'URL DexPay. */
  async startCheckout(organizationId: string, userId: string, plan: PayablePlan, billingCycle: BillingCycle) {
    if (!this.dexpay.isConfigured()) {
      throw new ServiceUnavailableException(
        'Le paiement en ligne n\'est pas encore disponible. Contactez le support pour changer de formule.',
      );
    }

    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organisation introuvable');
    if (org.subscriptionPlan === 'ENTERPRISE') {
      throw new BadRequestException('La formule Enterprise se gère avec l\'équipe PLANORA 360');
    }

    const amount = planPrice(plan, billingCycle);
    const reference = `PLN-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const metadata = { organization_id: organizationId, plan, billing_cycle: billingCycle, requested_by: userId };

    await this.prisma.payment.create({
      data: {
        organizationId,
        dexpayReference: reference,
        amount,
        currency: PLAN_CURRENCY,
        status: 'pending',
        plan: plan as SubscriptionPlan,
        metadata,
      },
    });

    const frontendUrl = this.frontendUrl();
    try {
      const session = await this.dexpay.createCheckoutSession({
        reference,
        itemName: `PLANORA 360 - Formule ${PLAN_LABELS[plan]} (${billingCycle === 'YEARLY' ? 'annuel' : 'mensuel'})`,
        amount,
        currency: PLAN_CURRENCY,
        successUrl: `${frontendUrl}/payment/success?ref=${reference}`,
        failureUrl: `${frontendUrl}/payment/failed?ref=${reference}`,
        webhookUrl: this.webhookUrl(),
        metadata,
      });
      return { reference, paymentUrl: session.payment_url, amount, currency: PLAN_CURRENCY };
    } catch (error) {
      await this.prisma.payment.update({ where: { dexpayReference: reference }, data: { status: 'failed' } });
      throw error;
    }
  }

  /**
   * État d'un paiement de l'organisation. S'il est encore en attente, DexPay est interrogé
   * directement : la formule s'active même si le webhook n'est pas (encore) arrivé.
   */
  async paymentStatus(organizationId: string, reference: string) {
    let payment = await this.prisma.payment.findFirst({ where: { dexpayReference: reference, organizationId } });
    if (!payment) throw new NotFoundException('Paiement introuvable');

    if (payment.status === 'pending') {
      try {
        const session = await this.dexpay.getCheckoutSession(reference);
        const remote = session?.status;
        if (remote === 'completed') {
          await this.completePayment({ reference, amount: session?.amount, currency: session?.currency });
        } else if (remote === 'failed' || remote === 'cancelled') {
          await this.markPayment(reference, remote);
        }
        payment = (await this.prisma.payment.findUnique({ where: { dexpayReference: reference } }))!;
      } catch {
        // DexPay injoignable : on renvoie l'état connu, le webhook prendra le relais
      }
    }

    return this.publicPayment(payment);
  }

  /**
   * Paiement confirmé : idempotent (un webhook rejoué ou une vérification simultanée n'appliquent
   * la formule qu'une fois). Renvoie false si le paiement est inconnu, déjà traité ou refusé.
   */
  async completePayment(event: CheckoutEvent): Promise<boolean> {
    const payment = await this.prisma.payment.findUnique({ where: { dexpayReference: event.reference } });
    if (!payment) {
      this.logger.warn(`Paiement confirmé inconnu : ${event.reference}`);
      return false;
    }
    if (payment.status === 'completed') return false;

    // Le montant encaissé doit correspondre exactement à celui demandé
    const paidAmount = Number(event.amount);
    const paidCurrency = event.currency ?? payment.currency;
    if (event.amount !== undefined && (paidAmount !== payment.amount || paidCurrency !== payment.currency)) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'amount_mismatch' } });
      this.logger.error(
        `Paiement ${payment.dexpayReference} : montant reçu ${paidAmount} ${paidCurrency}, attendu ${payment.amount} ${payment.currency}. Formule non activée.`,
      );
      return false;
    }

    const billingCycle: BillingCycle = (payment.metadata as any)?.billing_cycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

    const applied = await this.prisma.$transaction(async (tx) => {
      // Seul le premier passage fait passer le paiement à « completed » et applique la formule
      const { count } = await tx.payment.updateMany({
        where: { id: payment.id, status: { in: ['pending', 'failed', 'cancelled'] } },
        data: {
          status: 'completed',
          paidAt: new Date(),
          paymentMethod: event.operator ?? event.payment_method ?? null,
          dexpayCheckoutId: event.checkout_session_id ?? undefined,
        },
      });
      if (count === 0) return null;

      const org = await tx.organization.findUniqueOrThrow({ where: { id: payment.organizationId } });
      const now = new Date();
      // Même formule encore active : la nouvelle période s'ajoute à la suite ; sinon elle démarre maintenant
      const extendsCurrent =
        org.subscriptionPlan === payment.plan &&
        org.subscriptionStatus === 'ACTIVE' &&
        org.currentPeriodEnd !== null &&
        org.currentPeriodEnd > now;
      const periodStart = extendsCurrent ? org.currentPeriodEnd! : now;
      const periodEnd = addPeriod(periodStart, billingCycle);

      await tx.payment.update({ where: { id: payment.id }, data: { periodStart, periodEnd } });
      await tx.organization.update({
        where: { id: payment.organizationId },
        data: {
          subscriptionPlan: payment.plan,
          subscriptionStatus: 'ACTIVE',
          subscriptionCurrency: payment.currency,
          billingCycle,
          currentPeriodEnd: periodEnd,
          nextPaymentDate: periodEnd,
        },
      });
      return { periodEnd, organizationName: org.name };
    });

    if (!applied) return false;

    await this.cacheInvalidation.invalidateAll(payment.organizationId);
    this.logger.log(`Formule ${payment.plan} activée pour ${payment.organizationId} jusqu'au ${applied.periodEnd.toISOString()}`);
    await this.sendConfirmation(payment, applied.periodEnd, applied.organizationName);
    return true;
  }

  /** Échec ou annulation (paiement en attente), remboursement (paiement confirmé). */
  async markPayment(reference: string, status: 'failed' | 'cancelled' | 'refunded') {
    const allowedFrom = status === 'refunded' ? ['completed'] : ['pending'];
    const { count } = await this.prisma.payment.updateMany({
      where: { dexpayReference: reference, status: { in: allowedFrom } },
      data: { status },
    });
    if (count && status === 'refunded') {
      // Un remboursement ne retire pas la formule automatiquement : décision laissée à l'équipe
      this.logger.warn(`Paiement ${reference} remboursé : vérifier la formule de l'organisation`);
    }
  }

  private publicPayment(payment: Payment) {
    return {
      reference: payment.dexpayReference,
      status: payment.status,
      plan: payment.plan,
      amount: payment.amount,
      currency: payment.currency,
      billingCycle: (payment.metadata as any)?.billing_cycle ?? null,
      periodEnd: payment.periodEnd,
      paidAt: payment.paidAt,
    };
  }

  private async sendConfirmation(payment: Payment, periodEnd: Date, organizationName: string) {
    const requestedBy = (payment.metadata as any)?.requested_by as string | undefined;
    const recipient = await this.prisma.user.findFirst({
      where: requestedBy
        ? { id: requestedBy, organizationId: payment.organizationId, deletedAt: null }
        : { organizationId: payment.organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { email: true, firstName: true },
    });
    if (!recipient) return;
    try {
      await this.notifications.sendPaymentConfirmation({
        email: recipient.email,
        firstName: recipient.firstName,
        organizationName,
        planLabel: PLAN_LABELS[payment.plan],
        amount: payment.amount,
        currency: payment.currency,
        reference: payment.dexpayReference,
        periodEnd,
      });
    } catch (error) {
      this.logger.error(`E-mail de confirmation non envoyé (${payment.dexpayReference}) : ${error}`);
    }
  }

  /**
   * Adresse du webhook : <API_PUBLIC_URL>/api/dexpay/webhook. Sans API_PUBLIC_URL, pas de webhook :
   * la formule s'active quand l'utilisateur revient sur la page de succès (vérification auprès de DexPay).
   */
  private webhookUrl(): string | undefined {
    const raw = this.config.get<string>('API_PUBLIC_URL')?.trim();
    if (!raw) {
      this.logger.warn('API_PUBLIC_URL non définie : paiement sans webhook (activation au retour sur la page de succès)');
      return undefined;
    }
    return `${raw.replace(/\/+$/, '').replace(/\/api$/, '')}/api/dexpay/webhook`;
  }

  /** Première origine de FRONTEND_URL (la variable peut en lister plusieurs pour CORS). */
  private frontendUrl(): string {
    const raw = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    return raw.split(',')[0].trim().replace(/\/+$/, '');
  }
}
