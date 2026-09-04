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
  private readonly apiKey: string;
  private readonly webhookSecret: string;

  constructor(private config: ConfigService) {
    this.apiUrl = this.config.get<string>('DEXPAY_API_URL');
    this.apiKey = this.config.get<string>('DEXPAY_API_KEY');
    this.webhookSecret = this.config.get<string>('DEXPAY_WEBHOOK_SECRET');

    if (!this.apiUrl || !this.apiKey) {
      this.logger.warn('⚠️ DexPay non configuré - Paiements désactivés');
    }
  }

  /**
   * Créer une checkout session DexPay
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    try {
      const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'https://planora360.org';
      const webhookUrl = `${frontendUrl.replace(/\/+$/, '')}/api/dexpay/webhook`;

      const response = await axios.post(
        `${this.apiUrl}/checkout-sessions`,
        {
          amount: params.amount,
          currency: params.currency,
          customer: {
            email: params.customerEmail,
            name: params.customerName,
          },
          description: params.description,
          success_url: params.successUrl,
          failure_url: params.failureUrl,
          webhook_url: webhookUrl, // URL pour recevoir les notifications
          metadata: {
            organization_id: params.organizationId,
            plan: params.plan,
          },
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`✅ Checkout session créée: ${response.data.data.reference}`);

      return {
        reference: response.data.data.reference,
        payment_url: response.data.data.payment_url,
        status: response.data.data.status,
      };
    } catch (error) {
      this.logger.error(`❌ Erreur création checkout: ${error.message}`);
      throw error;
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
            'x-api-key': this.apiKey,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`❌ Erreur récupération checkout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier la signature HMAC-SHA256 d'un webhook DexPay
   * Header: X-Webhook-Signature
   */
  verifyWebhookSignature(signature: string, payload: any): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('⚠️ Webhook secret non configuré - Signature non vérifiée');
      return true; // Développement uniquement
    }

    if (!signature) {
      this.logger.error('❌ Aucune signature fournie dans le header X-Webhook-Signature');
      return false;
    }

    try {
      const crypto = require('crypto');
      const computedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isValid = computedSignature === signature;

      if (!isValid) {
        this.logger.error('❌ Signature webhook invalide');
        this.logger.debug(`Expected: ${computedSignature}`);
        this.logger.debug(`Received: ${signature}`);
      }

      return isValid;
    } catch (error) {
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
      MONTHLY: parseInt(this.config.get<string>('PLAN_INDIVIDUEL_MONTHLY')) || 1000000,  // 10 000 FCFA/mois
      YEARLY: parseInt(this.config.get<string>('PLAN_INDIVIDUEL_YEARLY')) || 10000000,  // 100 000 FCFA/an
    };

    return prices[billingCycle] || prices.MONTHLY;
  }
}
