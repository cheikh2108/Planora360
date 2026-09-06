import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface CreateCheckoutParams {
  amount: number;          // en centimes (ex: 1000000 = 10 000 XOF)
  currency: string;        // XOF
  customerEmail: string;
  customerName: string;
  description: string;
  plan: string;           // INDIVIDUEL uniquement
  billingCycle: 'MONTHLY' | 'YEARLY';
  organizationId: string;
  successUrl: string;
  failureUrl: string;
}

export interface CheckoutSession {
  reference: string;
  payment_url: string;
  status: string;
}

@Injectable()
export class DexpayService {
  private readonly logger = new Logger(DexpayService.name);
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly secretKey: string;

  constructor(private config: ConfigService) {
    // Auto-détection sandbox/production basée sur les clés
    this.publicKey = this.config.get<string>('DEXPAY_PUBLIC_KEY') || '';
    this.secretKey = this.config.get<string>('DEXPAY_SECRET_KEY') || '';

    // Déterminer l'URL correcte en fonction de l'environnement
    const env = this.config.get<string>('DEXPAY_ENV') || 'sandbox';
    const configuredUrl = this.config.get<string>('DEXPAY_API_URL');

    if (env === 'live' || this.publicKey.startsWith('pk_live_')) {
      this.apiUrl = configuredUrl || 'https://api.dexpay.africa/api/v1';
      this.logger.log('🔴 DexPay en mode PRODUCTION');
    } else {
      this.apiUrl = configuredUrl || 'https://api.sandbox.dexpay.africa/api/v1';
      this.logger.log('🟢 DexPay en mode SANDBOX');
    }

    if (!this.apiUrl || !this.publicKey || !this.secretKey) {
      this.logger.warn('⚠️ DexPay non configuré - Paiements désactivés');
    } else {
      this.logger.log(`📍 URL: ${this.apiUrl}`);
      this.logger.log(`🔑 Clé: ${this.publicKey.substring(0, 15)}...`);
    }
  }

  /**
   * Créer une checkout session DexPay
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    try {
      this.logger.log(`🚀 Création checkout session DexPay pour ${params.customerEmail}`);

      this.logger.debug(`🔑 Utilisation clé: ${this.publicKey.substring(0, 20)}...`);
      this.logger.debug(`📍 URL API: ${this.apiUrl}`);

      // Prendre la première URL si FRONTEND_URL contient plusieurs valeurs séparées par virgule
      const frontendUrlRaw = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';
      const frontendUrl = frontendUrlRaw.split(',')[0].trim();
      const webhookUrl = `${this.apiUrl.replace(/\/api\/v1$/, '')}/api/dexpay/webhook`;

      const payload = {
        reference: `ORG-${params.organizationId}-${Date.now()}`,
        item_name: params.description,
        amount: params.amount,
        currency: params.currency,
        success_url: params.successUrl,
        failure_url: params.failureUrl,
        webhook_url: webhookUrl,
        customer: {
          email: params.customerEmail,
          name: params.customerName,
        },
        metadata: {
          organization_id: params.organizationId,
          plan: params.plan,
          billing_cycle: params.billingCycle,
        },
      };

      this.logger.debug(`📦 Payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await axios.post(
        `${this.apiUrl}/checkout-sessions`,
        payload,
        {
          headers: {
            'x-api-key': this.publicKey,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`✅ Checkout session créée: ${response.data.data.reference}`);
      this.logger.log(`🔗 URL paiement: ${response.data.data.payment_url}`);

      return {
        reference: response.data.data.reference,
        payment_url: response.data.data.payment_url,
        status: response.data.data.status,
      };
    } catch (error: any) {
      const dexpayError = error.response?.data;
      this.logger.error(`❌ Erreur création checkout: ${error.message}`);
      this.logger.error(`🔢 Status Code: ${error.response?.status}`);
      if (dexpayError) {
        this.logger.error(`📛 DexPay response: ${JSON.stringify(dexpayError, null, 2)}`);
      }
      if (error.response?.status === 403) {
        this.logger.error('🚫 Erreur 403: Vérifiez que l\'URL correspond aux clés (sandbox avec pk_test, production avec pk_live)');
      }
      if (error.response?.status === 422) {
        this.logger.error('⚠️ Erreur 422: Données invalides. Vérifiez le format du payload ci-dessus.');
      }
      throw new Error(`DexPay API Error (${error.response?.status || 'unknown'}): ${JSON.stringify(dexpayError || error.message)}`);
    }
  }

  /**
   * Récupérer le statut d'une checkout session
   */
  async getCheckoutSession(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/checkout-sessions/${reference}`,
        {
          headers: {
            'x-api-key': this.publicKey,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      this.logger.error(`❌ Erreur récupération checkout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier la signature HMAC-SHA256 d'un webhook DexPay
   * Header: x-dexchange-signature
   */
  verifyWebhookSignature(signature: string, payload: any): boolean {
    if (!this.secretKey) {
      this.logger.warn('⚠️ Secret key non configurée - Signature non vérifiée');
      return true; // Développement uniquement
    }

    if (!signature) {
      this.logger.error('❌ Aucune signature fournie dans le header x-dexchange-signature');
      return false;
    }

    try {
      const crypto = require('crypto');
      const computedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isValid = computedSignature === signature;

      if (!isValid) {
        this.logger.error('❌ Signature webhook invalide');
        this.logger.debug(`Expected: ${computedSignature}`);
        this.logger.debug(`Received: ${signature}`);
      }

      return isValid;
    } catch (error: any) {
      this.logger.error(`❌ Erreur vérification signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Calculer le prix d'un plan (INDIVIDUEL uniquement)
   */
  getPlanPrice(plan: string, billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY'): number {
    if (plan !== 'INDIVIDUEL') {
      throw new Error(`Le plan ${plan} n'est pas disponible en paiement automatique. Veuillez demander un devis.`);
    }

    const prices = {
      MONTHLY: parseInt(this.config.get<string>('PLAN_INDIVIDUEL_MONTHLY') || '1000000'),
      YEARLY: parseInt(this.config.get<string>('PLAN_INDIVIDUEL_YEARLY') || '10000000'),
    };

    return prices[billingCycle] || prices.MONTHLY;
  }
}
