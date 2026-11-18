import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingCycle, Payment, SubscriptionPlan } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
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
  async startCheckout(
    organizationId: string,
    userId: string,
    plan: PayablePlan,
    billingCycle: BillingCycle,
    options: { registration?: boolean } = {},
  ) {
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
    const metadata = {
      organization_id: organizationId,
      plan,
      billing_cycle: billingCycle,
      requested_by: userId,
      // Inscription payée : le compte est créé (activé) à la confirmation du paiement
      ...(options.registration ? { registration: true } : {}),
    };
    const signup = options.registration ? '&signup=1' : '';

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
        successUrl: `${frontendUrl}/payment/success?ref=${reference}${signup}`,
        failureUrl: `${frontendUrl}/payment/failed?ref=${reference}${signup}`,
        webhookUrl: this.webhookUrl(),
        // DexPay n'accepte que des valeurs texte
        metadata: Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)])),
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
    const payment = await this.prisma.payment.findFirst({ where: { dexpayReference: reference, organizationId } });
    if (!payment) throw new NotFoundException('Paiement introuvable');
    return this.publicPayment(await this.refreshPending(payment));
  }

  /** Paiement encore en attente : DexPay est interrogé directement (le webhook peut tarder). */
  private async refreshPending(payment: Payment): Promise<Payment> {
    if (payment.status !== 'pending') return payment;
    const reference = payment.dexpayReference;
    try {
      const session = await this.dexpay.getCheckoutSession(reference);
      const remote = session?.status;
      if (remote === 'completed') {
        await this.completePayment({ reference, amount: session?.amount, currency: session?.currency });
      } else if (remote === 'failed' || remote === 'cancelled') {
        await this.markPayment(reference, remote);
      }
      return (await this.prisma.payment.findUnique({ where: { dexpayReference: reference } }))!;
    } catch {
      // DexPay injoignable : on renvoie l'état connu, le webhook prendra le relais
      return payment;
    }
  }

  /** Paiement d'une inscription (public : la personne n'a pas encore de compte actif). */
  private async findSignupPayment(reference: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({ where: { dexpayReference: reference } });
    if (!payment || (payment.metadata as any)?.registration !== true) {
      throw new NotFoundException('Paiement introuvable');
    }
    return payment;
  }

  /** État du paiement d'une inscription, pour la page de retour (sans connexion). */
  async signupPaymentStatus(reference: string) {
    const payment = await this.refreshPending(await this.findSignupPayment(reference));
    const { reference: ref, status, plan, amount, currency, billingCycle } = this.publicPayment(payment);
    return { reference: ref, status, plan, amount, currency, billingCycle };
  }

  /** Nouveau paiement pour une inscription dont le paiement a échoué ou a été annulé. */
  async retrySignupPayment(reference: string) {
    const payment = await this.findSignupPayment(reference);
    const org = await this.prisma.organization.findUnique({ where: { id: payment.organizationId } });
    if (!org || org.deletedAt || org.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Ce compte est déjà activé : connectez-vous avec les identifiants reçus par e-mail.');
    }
    const meta = payment.metadata as any;
    const billingCycle: BillingCycle = meta?.billing_cycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
    return this.startCheckout(org.id, meta?.requested_by, payment.plan as PayablePlan, billingCycle, {
      registration: true,
    });
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
      // Inscription payée : l'organisation passe d'« en attente de paiement » à active
      const activatesRegistration = org.status === 'PENDING_PAYMENT';

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
          ...(activatesRegistration ? { status: 'ACTIVE' as const } : {}),
        },
      });
      return { periodEnd, organizationName: org.name, activatesRegistration };
    });

    if (!applied) return false;

    await this.cacheInvalidation.invalidateAll(payment.organizationId);
    this.logger.log(`Formule ${payment.plan} activée pour ${payment.organizationId} jusqu'au ${applied.periodEnd.toISOString()}`);
    if (applied.activatesRegistration) {
      await this.activateRegistrationAccount(payment, applied.organizationName, billingCycle);
    }
    await this.sendConfirmation(payment, applied.periodEnd, applied.organizationName);
    return true;
  }

  /**
   * Après le paiement d'une inscription : le compte de la personne est activé avec un mot de passe
   * temporaire (changement obligatoire à la première connexion), envoyé par e-mail ; le support est prévenu.
   */
  private async activateRegistrationAccount(payment: Payment, organizationName: string, billingCycle: BillingCycle) {
    const user = await this.prisma.user.findFirst({
      where: { organizationId: payment.organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    if (!user) return;

    const tempPassword = randomBytes(8).toString('base64url').slice(0, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        passwordHash: await bcrypt.hash(tempPassword, 12),
        mustChangePassword: true,
        tokensValidAfter: new Date(),
      },
    });

    try {
      await this.notifications.sendWelcomeCredentials({
        email: user.email,
        firstName: user.firstName,
        orgName: organizationName,
        tempPassword,
      });
    } catch (error) {
      this.logger.error(`Identifiants non envoyés à l'inscription ${payment.organizationId} : ${error}`);
    }
    try {
      await this.notifications.sendPaidSignupToSupport({
        organizationName,
        organizationId: payment.organizationId,
        planLabel: PLAN_LABELS[payment.plan],
        billingCycle,
        amount: payment.amount,
        currency: payment.currency,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      this.logger.error(`Support non prévenu de l'inscription ${payment.organizationId} : ${error}`);
    }
  }

  /**
   * Relances d'échéance (tâche quotidienne) : e-mail 7 jours avant, la veille, puis le jour où
   * l'abonnement expire (statut PAST_DUE ; l'accès est alors bloqué jusqu'au renouvellement).
   * Chaque fenêtre couvre 24 h, la tâche tournant une fois par jour : un seul e-mail par étape.
   */
  async sendRenewalReminders(now = new Date()) {
    const day = 24 * 3600 * 1000;
    const windows = [
      { kind: 'J7' as const, from: new Date(now.getTime() + 6 * day), to: new Date(now.getTime() + 7 * day) },
      { kind: 'J1' as const, from: now, to: new Date(now.getTime() + day) },
      { kind: 'EXPIRED' as const, from: new Date(now.getTime() - day), to: now },
    ];
    let sent = 0;
    for (const w of windows) {
      const orgs = await this.prisma.organization.findMany({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          subscriptionPlan: { not: 'ENTERPRISE' },
          currentPeriodEnd: { gt: w.from, lte: w.to },
        },
        select: { id: true, name: true, subscriptionPlan: true, currentPeriodEnd: true },
      });
      for (const org of orgs) {
        if (w.kind === 'EXPIRED') {
          await this.prisma.organization.update({ where: { id: org.id }, data: { subscriptionStatus: 'PAST_DUE' } });
          await this.cacheInvalidation.invalidateAll(org.id);
        }
        const admins = await this.prisma.user.findMany({
          where: { organizationId: org.id, deletedAt: null, isActive: true, role: { name: 'Administrateur' } },
          select: { email: true, firstName: true },
        });
        for (const admin of admins) {
          try {
            await this.notifications.sendSubscriptionReminder({
              email: admin.email,
              firstName: admin.firstName,
              organizationName: org.name,
              planLabel: PLAN_LABELS[org.subscriptionPlan],
              periodEnd: org.currentPeriodEnd!,
              kind: w.kind,
              renewUrl: `${this.frontendUrl()}/payment/renew`,
            });
            sent += 1;
          } catch (error) {
            this.logger.error(`Relance d'échéance non envoyée (${org.id}) : ${error}`);
          }
        }
      }
    }
    return sent;
  }

  /** Inscriptions jamais payées : supprimées après 7 jours (le nom et l'e-mail redeviennent libres). */
  async purgeUnpaidRegistrations(now = new Date()) {
    const cutoff = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const stale = await this.prisma.organization.findMany({
      where: { status: 'PENDING_PAYMENT', createdAt: { lt: cutoff }, payments: { none: { status: 'completed' } } },
      select: { id: true },
    });
    for (const { id } of stale) {
      await this.prisma.$transaction([
        this.prisma.payment.deleteMany({ where: { organizationId: id } }),
        this.prisma.user.deleteMany({ where: { organizationId: id } }),
        this.prisma.organization.delete({ where: { id } }),
      ]);
    }
    return stale.length;
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
