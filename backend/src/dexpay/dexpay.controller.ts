import { Controller, Post, Get, Body, Param, Headers, Logger, BadRequestException } from '@nestjs/common';
import { DexpayService } from './dexpay.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('dexpay')
export class DexpayController {
  private readonly logger = new Logger(DexpayController.name);

  constructor(
    private dexpay: DexpayService,
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Webhook DexPay - Recevoir les notifications de paiement
   * POST /dexpay/webhook
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('X-Webhook-Signature') signature: string,
    @Body() payload: any,
  ) {
    this.logger.log(`📥 Webhook reçu: ${payload.event}`);

    // Vérifier la signature (sécurité)
    const isValid = this.dexpay.verifyWebhookSignature(signature, payload);
    if (!isValid) {
      this.logger.error('❌ Signature webhook invalide');
      throw new BadRequestException('Invalid signature');
    }

    const { event, data } = payload;

    try {
      switch (event) {
        case 'checkout.completed':
          await this.handleCheckoutCompleted(data);
          break;

        case 'checkout.failed':
          await this.handleCheckoutFailed(data);
          break;

        case 'checkout.cancelled':
          await this.handleCheckoutCancelled(data);
          break;

        default:
          this.logger.log(`ℹ️ Événement non géré: ${event}`);
      }
    } catch (error) {
      this.logger.error(`❌ Erreur traitement webhook: ${error.message}`);
      throw error;
    }

    return { received: true };
  }

  /**
   * Vérifier le statut d'un paiement
   * GET /dexpay/status/:reference
   */
  @Get('status/:reference')
  async checkPaymentStatus(@Param('reference') reference: string) {
    const session = await this.dexpay.getCheckoutSession(reference);
    return { status: session.status, data: session };
  }

  /**
   * Gérer un paiement réussi
   */
  private async handleCheckoutCompleted(data: any) {
    this.logger.log(`✅ Paiement réussi: ${data.reference}`);

    const { reference, amount, currency, customer, metadata, payment_method } = data;
    const organizationId = metadata?.organization_id;
    const plan = metadata?.plan;

    if (!organizationId) {
      this.logger.error('❌ organization_id manquant dans metadata');
      return;
    }

    // 1. Enregistrer le paiement
    await this.prisma.payment.create({
      data: {
        organizationId,
        dexpayReference: reference,
        dexpayCheckoutId: data.id,
        amount,
        currency,
        status: 'completed',
        paymentMethod: payment_method,
        plan,
        paidAt: new Date(),
      },
    });

    // 2. Mettre à jour l'organisation
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1); // +1 mois

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: 'ACTIVE',
        subscriptionCurrency: currency,
        currentPeriodEnd: periodEnd,
        nextPaymentDate: periodEnd,
        status: 'PENDING_VERIFICATION', // Attente vérification email
      },
    });

    // 3. Générer token de vérification email
    const token = this.generateToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Expire dans 24h

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: tokenExpiry,
      },
    });

    // 4. Récupérer l'admin de l'organisation
    const admin = await this.prisma.user.findFirst({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (admin) {
      // 5. Envoyer l'email de vérification
      await this.notifications.sendEmailVerification({
        email: admin.email,
        firstName: admin.firstName,
        token,
      });
    }

    this.logger.log(`✅ Organisation ${organizationId} mise à jour, email envoyé`);
  }

  /**
   * Gérer un paiement échoué
   */
  private async handleCheckoutFailed(data: any) {
    this.logger.warn(`⚠️ Paiement échoué: ${data.reference}`);

    const { reference, metadata } = data;
    const organizationId = metadata?.organization_id;

    if (organizationId) {
      await this.prisma.payment.create({
        data: {
          organizationId,
          dexpayReference: reference,
          amount: data.amount,
          currency: data.currency,
          status: 'failed',
          plan: metadata?.plan,
        },
      });
    }
  }

  /**
   * Gérer un paiement annulé
   */
  private async handleCheckoutCancelled(data: any) {
    this.logger.log(`❌ Paiement annulé: ${data.reference}`);

    const { reference, metadata } = data;
    const organizationId = metadata?.organization_id;

    if (organizationId) {
      await this.prisma.payment.create({
        data: {
          organizationId,
          dexpayReference: reference,
          amount: data.amount,
          currency: data.currency,
          status: 'cancelled',
          plan: metadata?.plan,
        },
      });
    }
  }

  /**
   * Générer un token de vérification sécurisé
   */
  private generateToken(): string {
    const { randomBytes } = require('crypto');
    return randomBytes(32).toString('hex');
  }
}
