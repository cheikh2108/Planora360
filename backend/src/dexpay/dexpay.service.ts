import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface CreateCheckoutParams {
  amount: number;          // en centimes (ex: 1000000 = 10 000 XOF)
  currency: string;        // XOF
  customerEmail: string;
  customerName: string;
  description: string;
  plan: string;           // INDIVIDUEL, PRO, EQUIPE, ORGANISATION
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
   * Vérifier la signature d'un webhook DexPay
   * (À adapter selon la doc DexPay pour la vérification de signature)
   */
  verifyWebhookSignature(signature: string, payload: any): boolean {
    // TODO: Implémenter la vérification selon la doc DexPay
    // Pour l'instant, on retourne true en développement
    if (!this.webhookSecret) {
      this.logger.warn('⚠️ Webhook secret non configuré - Signature non vérifiée');
      return true;
    }

    // Exemple de vérification (à adapter selon DexPay):
    // const computedSignature = crypto
    //   .createHmac('sha256', this.webhookSecret)
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    // return computedSignature === signature;

    return true; // À remplacer par la vraie vérification
  }

  /**
   * Calculer le prix d'un plan
   */
  getPlanPrice(plan: string): number {
    const prices = {
      INDIVIDUEL: parseInt(this.config.get<string>('PLAN_INDIVIDUEL_PRICE')) || 1000000,
      PRO: parseInt(this.config.get<string>('PLAN_PRO_PRICE')) || 2500000,
      EQUIPE: parseInt(this.config.get<string>('PLAN_EQUIPE_PRICE')) || 5000000,
      ORGANISATION: parseInt(this.config.get<string>('PLAN_ORGANISATION_PRICE')) || 10000000,
    };

    return prices[plan] || 0;
  }
}
