import {
  Controller, Post, Get, Param, Headers, Logger, BadRequestException, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { DexpayService } from './dexpay.service';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('dexpay')
export class DexpayController {
  private readonly logger = new Logger(DexpayController.name);

  constructor(
    private readonly dexpay: DexpayService,
    private readonly billing: BillingService,
  ) {}

  /**
   * Webhook DexPay (serveur à serveur, exempté de CSRF).
   * POST /dexpay/webhook — X-Webhook-Signature (HMAC-SHA256 hex du corps brut) obligatoire.
   * Charge utile plate : { event, reference, amount, currency, status, metadata, ... }.
   * Répond 200 dès que l'événement est authentifié, même s'il est ignoré, pour éviter les relances.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest,
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-event') eventHeader?: string,
  ) {
    if (!this.dexpay.verifyWebhookSignature(signature, req.rawBody)) {
      throw new BadRequestException('Signature invalide');
    }

    const body: any = req.body ?? {};
    const event: string | undefined = body.event ?? eventHeader;
    const reference: string | undefined = body.reference;
    if (!event || typeof reference !== 'string' || !reference) {
      throw new BadRequestException('Événement incomplet');
    }

    this.logger.log(`Webhook DexPay : ${event} (${reference})`);

    switch (event) {
      case 'checkout.completed':
        await this.billing.completePayment({
          reference,
          amount: body.amount,
          currency: body.currency,
          payment_method: body.payment_method,
          operator: body.operator,
          transaction_id: body.transaction_id,
          checkout_session_id: body.checkout_session_id,
        });
        break;
      case 'checkout.failed':
        await this.billing.markPayment(reference, 'failed');
        break;
      case 'checkout.cancelled':
        await this.billing.markPayment(reference, 'cancelled');
        break;
      case 'checkout.refunded':
        await this.billing.markPayment(reference, 'refunded');
        break;
      default:
        // checkout.initiated, payout.*… : rien à faire
        break;
    }

    return { received: true };
  }

  /**
   * État d'un paiement de l'organisation (page de retour après paiement).
   * GET /dexpay/status/:reference — vérifie auprès de DexPay si le paiement est encore en attente.
   */
  @Get('status/:reference')
  @UseGuards(JwtAuthGuard)
  checkPaymentStatus(@Param('reference') reference: string, @CurrentUser() user: any) {
    return this.billing.paymentStatus(user.organizationId, reference);
  }
}
