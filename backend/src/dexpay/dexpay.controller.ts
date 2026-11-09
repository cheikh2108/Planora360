import {
  Controller, Post, Get, Param, Headers, Logger, BadRequestException, NotFoundException,
  Req, UseGuards, HttpCode, HttpStatus, BadGatewayException,
} from '@nestjs/common';
import { Request } from 'express';
import { randomBytes } from 'crypto';
import { SubscriptionPlan } from '@prisma/client';
import { DexpayService } from './dexpay.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

type RawBodyRequest = Request & { rawBody?: Buffer };

const PLANS = Object.values(SubscriptionPlan) as string[];

@Controller('dexpay')
export class DexpayController {
  private readonly logger = new Logger(DexpayController.name);

  constructor(
    private dexpay: DexpayService,
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Webhook DexPay (appel serveur à serveur, exempté de CSRF).
   * POST /dexpay/webhook — signature HMAC-SHA256 du corps brut obligatoire.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest,
    @Headers('x-webhook-signature') webhookSignature?: string,
    @Headers('x-dexchange-signature') dexchangeSignature?: string,
  ) {
    const signature = webhookSignature ?? dexchangeSignature;
    if (!this.dexpay.verifyWebhookSignature(signature, req.rawBody)) {
      throw new BadRequestException('Signature invalide');
    }

    const payload: any = req.body ?? {};
    const { event, data } = payload;
    if (!event || !data?.reference) {
      throw new BadRequestException('Événement incomplet');
    }

    this.logger.log(`📥 Webhook DexPay : ${event} (${data.reference})`);

    switch (event) {
      case 'checkout.completed':
        await this.handleCheckoutCompleted(data);
        break;
      case 'checkout.failed':
        await this.recordPayment(data, 'failed');
        break;
      case 'checkout.cancelled':
        await this.recordPayment(data, 'cancelled');
        break;
      default:
        this.logger.log(`ℹ️ Événement non géré : ${event}`);
    }

    return { received: true };
  }

  /**
   * Statut d'un paiement de l'organisation de l'utilisateur.
   * GET /dexpay/status/:reference
   */
  @Get('status/:reference')
  @UseGuards(JwtAuthGuard)
  async checkPaymentStatus(@Param('reference') reference: string, @CurrentUser() user: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { dexpayReference: reference, organizationId: user.organizationId },
    });
    if (!payment) throw new NotFoundException('Paiement introuvable');

    try {
      const session = await this.dexpay.getCheckoutSession(reference);
      return { status: session?.status ?? payment.status, payment };
    } catch {
      // DexPay injoignable : on renvoie l'état connu localement plutôt qu'une erreur 500
      if (payment.status) return { status: payment.status, payment };
      throw new BadGatewayException('Service de paiement indisponible');
    }
  }

  /** Paiement réussi : enregistre le paiement (idempotent) puis active l'abonnement. */
  private async handleCheckoutCompleted(data: any) {
    const organizationId: string | undefined = data.metadata?.organization_id;
    const plan: string | undefined = data.metadata?.plan;

    if (!organizationId || !plan || !PLANS.includes(plan)) {
      throw new BadRequestException('Métadonnées de paiement invalides');
    }
    const organization = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!organization) throw new BadRequestException('Organisation inconnue');

    const already = await this.prisma.payment.findUnique({ where: { dexpayReference: data.reference } });
    if (already?.status === 'completed') {
      this.logger.log(`↩️ Paiement ${data.reference} déjà traité`);
      return;
    }

    await this.recordPayment(data, 'completed');

    const periodEnd = new Date();
    if (organization.billingCycle === 'YEARLY') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);

    const token = randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionPlan: plan as SubscriptionPlan,
        subscriptionStatus: 'ACTIVE',
        subscriptionCurrency: data.currency ?? organization.subscriptionCurrency,
        currentPeriodEnd: periodEnd,
        nextPaymentDate: periodEnd,
        status: 'PENDING_VERIFICATION', // attente vérification email
        emailVerificationToken: token,
        emailVerificationExpiry: tokenExpiry,
      },
    });

    const admin = await this.prisma.user.findFirst({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    if (admin) {
      await this.notifications.sendEmailVerification({ email: admin.email, firstName: admin.firstName, token });
    }

    this.logger.log(`✅ Organisation ${organizationId} : abonnement ${plan} activé`);
  }

  /** Enregistre ou met à jour un paiement par sa référence (événements rejoués sans erreur). */
  private async recordPayment(data: any, status: 'completed' | 'failed' | 'cancelled') {
    const organizationId: string | undefined = data.metadata?.organization_id;
    if (!organizationId) return;
    const exists = await this.prisma.organization.count({ where: { id: organizationId } });
    if (!exists) return;

    const plan = PLANS.includes(data.metadata?.plan) ? (data.metadata.plan as SubscriptionPlan) : null;
    const common = {
      status,
      paymentMethod: data.payment_method ?? null,
      metadata: data.metadata ?? undefined,
      ...(status === 'completed' ? { paidAt: new Date() } : {}),
    };

    const existing = await this.prisma.payment.findUnique({ where: { dexpayReference: data.reference } });
    if (existing) {
      await this.prisma.payment.update({ where: { id: existing.id }, data: common });
      return;
    }
    if (!plan) return; // un paiement sans plan connu ne peut pas être enregistré

    await this.prisma.payment.create({
      data: {
        organizationId,
        dexpayReference: data.reference,
        dexpayCheckoutId: data.id ?? null,
        amount: Number.isFinite(Number(data.amount)) ? Math.round(Number(data.amount)) : 0,
        currency: data.currency ?? 'XOF',
        plan,
        ...common,
      },
    });
  }
}
