import { Injectable, Logger, ServiceUnavailableException, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Client DexPay (https://docs.dexpay.africa).
 * - Sessions de paiement : POST /checkout-sessions, clé publique dans `x-api-key`.
 * - Montants entiers dans la devise (10000 = 10 000 XOF, pas de centimes).
 * - Webhooks : en-tête X-Webhook-Signature = HMAC-SHA256 hexadécimal du corps brut, calculé avec
 *   la clé secrète (il n'existe pas de secret de webhook distinct).
 * Les clés pk_test/sk_test donnent des sessions de test sur la même API.
 */

export interface CreateCheckoutParams {
  reference: string;
  itemName: string;
  amount: number; // entier, unité de la devise
  currency: string;
  successUrl: string;
  failureUrl: string;
  webhookUrl?: string; // facultatif chez DexPay, recommandé
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  reference: string;
  payment_url: string;
  status: string;
}

const DEFAULT_API_URL = 'https://api.dexpay.africa/api/v1';
const HTTP_TIMEOUT_MS = 15_000;

@Injectable()
export class DexpayService {
  private readonly logger = new Logger(DexpayService.name);
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly secretKey: string;

  constructor(private config: ConfigService) {
    this.publicKey = this.config.get<string>('DEXPAY_PUBLIC_KEY') || '';
    this.secretKey = this.config.get<string>('DEXPAY_SECRET_KEY') || '';
    this.apiUrl = (this.config.get<string>('DEXPAY_API_URL') || DEFAULT_API_URL).replace(/\/+$/, '');

    if (!this.isConfigured()) {
      this.logger.warn('DexPay non configuré (DEXPAY_PUBLIC_KEY / DEXPAY_SECRET_KEY) : paiements désactivés');
    } else {
      this.logger.log(`DexPay configuré en mode ${this.isTestMode() ? 'TEST' : 'PRODUCTION'}`);
    }
  }

  isConfigured(): boolean {
    return !!this.publicKey && !!this.secretKey;
  }

  /** Clés de test (pk_test_…) : sessions de test, aucun argent réel. */
  isTestMode(): boolean {
    return this.publicKey.startsWith('pk_test_');
  }

  /** Crée une session de paiement et renvoie l'URL de la page de paiement DexPay. */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Le paiement en ligne n\'est pas configuré');
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/checkout-sessions`,
        {
          reference: params.reference,
          item_name: params.itemName,
          amount: params.amount,
          currency: params.currency,
          success_url: params.successUrl,
          failure_url: params.failureUrl,
          ...(params.webhookUrl && { webhook_url: params.webhookUrl }),
          is_one_shot_payment: true,
          metadata: params.metadata ?? {},
        },
        {
          headers: { 'x-api-key': this.publicKey, 'Content-Type': 'application/json' },
          timeout: HTTP_TIMEOUT_MS,
        },
      );

      const data = response.data?.data ?? {};
      // En test, DexPay fournit aussi une page de paiement simulé
      const paymentUrl: string | undefined = data.payment_url ?? data.sandbox_payment_url;
      if (!paymentUrl) throw new Error('Réponse DexPay sans payment_url');

      this.logger.log(`Session de paiement créée : ${params.reference}`);
      return { reference: data.reference ?? params.reference, payment_url: paymentUrl, status: data.status ?? 'initiated' };
    } catch (error: any) {
      const status = error.response?.status;
      // Le détail (sans données personnelles) aide au diagnostic : 401/403 = clé, 422 = champ refusé
      this.logger.error(
        `Création de session DexPay refusée (${status ?? 'réseau'}) pour ${params.reference} : ` +
          JSON.stringify(error.response?.data?.errors ?? error.response?.data?.message ?? error.message),
      );
      throw new BadGatewayException('Le service de paiement est indisponible, réessayez dans un instant');
    }
  }

  /** État d'une session (GET /checkout-sessions/:reference). */
  async getCheckoutSession(reference: string): Promise<{ status?: string; amount?: number; currency?: string } | null> {
    if (!this.isConfigured()) return null;
    const response = await axios.get(`${this.apiUrl}/checkout-sessions/${encodeURIComponent(reference)}`, {
      headers: { 'x-api-key': this.publicKey },
      timeout: HTTP_TIMEOUT_MS,
    });
    return response.data?.data ?? null;
  }

  /** Vérifie X-Webhook-Signature : HMAC-SHA256 hexadécimal du corps brut avec la clé secrète. */
  verifyWebhookSignature(signature: string | undefined, rawBody: Buffer | string | undefined): boolean {
    // Sans clé secrète, aucun webhook n'est accepté
    if (!this.secretKey) {
      this.logger.error('DEXPAY_SECRET_KEY non configurée : webhook refusé');
      return false;
    }
    if (!signature || !rawBody) {
      this.logger.warn('Webhook sans signature ou sans corps : refusé');
      return false;
    }

    const expected = createHmac('sha256', this.secretKey).update(rawBody).digest('hex');
    const received = signature.trim().toLowerCase();
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(received, 'utf8');
    const valid = a.length === b.length && timingSafeEqual(a, b);
    if (!valid) this.logger.warn('Signature de webhook invalide : refusé');
    return valid;
  }
}
