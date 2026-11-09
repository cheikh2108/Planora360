"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DexpayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
let DexpayService = DexpayService_1 = class DexpayService {
    config;
    logger = new common_1.Logger(DexpayService_1.name);
    apiUrl;
    publicKey;
    secretKey;
    constructor(config) {
        this.config = config;
        this.publicKey = this.config.get('DEXPAY_PUBLIC_KEY') || '';
        this.secretKey = this.config.get('DEXPAY_SECRET_KEY') || '';
        const env = this.config.get('DEXPAY_ENV') || 'sandbox';
        const configuredUrl = this.config.get('DEXPAY_API_URL');
        if (env === 'live' || this.publicKey.startsWith('pk_live_')) {
            this.apiUrl = configuredUrl || 'https://api.dexpay.africa/api/v1';
            this.logger.log('🔴 DexPay en mode PRODUCTION');
        }
        else {
            this.apiUrl = configuredUrl || 'https://api.sandbox.dexpay.africa/api/v1';
            this.logger.log('🟢 DexPay en mode SANDBOX');
        }
        if (!this.apiUrl || !this.publicKey || !this.secretKey) {
            this.logger.warn('⚠️ DexPay non configuré - Paiements désactivés');
        }
        else {
            this.logger.log(`📍 URL: ${this.apiUrl}`);
            this.logger.log(`🔑 Clé: ${this.publicKey.substring(0, 15)}...`);
        }
    }
    async createCheckoutSession(params) {
        try {
            this.logger.log(`🚀 Création checkout session DexPay pour ${params.customerEmail}`);
            this.logger.debug(`🔑 Utilisation clé: ${this.publicKey.substring(0, 20)}...`);
            this.logger.debug(`📍 URL API: ${this.apiUrl}`);
            const frontendUrlRaw = this.config.get('FRONTEND_URL') || 'http://localhost:3001';
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
            const response = await axios_1.default.post(`${this.apiUrl}/checkout-sessions`, payload, {
                headers: {
                    'x-api-key': this.publicKey,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`✅ Checkout session créée: ${response.data.data.reference}`);
            this.logger.log(`🔗 URL paiement: ${response.data.data.payment_url}`);
            return {
                reference: response.data.data.reference,
                payment_url: response.data.data.payment_url,
                status: response.data.data.status,
            };
        }
        catch (error) {
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
    async getCheckoutSession(reference) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/checkout-sessions/${reference}`, {
                headers: {
                    'x-api-key': this.publicKey,
                },
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error(`❌ Erreur récupération checkout: ${error.message}`);
            throw error;
        }
    }
    verifyWebhookSignature(signature, rawBody) {
        if (!this.secretKey) {
            this.logger.error('❌ DEXPAY_SECRET_KEY non configurée : webhook refusé');
            return false;
        }
        if (!signature || !rawBody) {
            this.logger.error('❌ Webhook sans signature ou sans corps');
            return false;
        }
        const expected = (0, crypto_1.createHmac)('sha256', this.secretKey).update(rawBody).digest('hex');
        const received = signature.trim().replace(/^sha256=/i, '');
        const a = Buffer.from(expected, 'utf8');
        const b = Buffer.from(received, 'utf8');
        const isValid = a.length === b.length && (0, crypto_1.timingSafeEqual)(a, b);
        if (!isValid) {
            this.logger.error('❌ Signature webhook invalide');
        }
        return isValid;
    }
    getPlanPrice(plan, billingCycle = 'MONTHLY') {
        if (plan !== 'INDIVIDUEL') {
            throw new Error(`Le plan ${plan} n'est pas disponible en paiement automatique. Veuillez demander un devis.`);
        }
        const prices = {
            MONTHLY: parseInt(this.config.get('PLAN_INDIVIDUEL_MONTHLY') || '1000000'),
            YEARLY: parseInt(this.config.get('PLAN_INDIVIDUEL_YEARLY') || '10000000'),
        };
        return prices[billingCycle] || prices.MONTHLY;
    }
};
exports.DexpayService = DexpayService;
exports.DexpayService = DexpayService = DexpayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DexpayService);
//# sourceMappingURL=dexpay.service.js.map