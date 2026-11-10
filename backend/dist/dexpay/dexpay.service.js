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
const DEFAULT_API_URL = 'https://api.dexpay.africa/api/v1';
const HTTP_TIMEOUT_MS = 15_000;
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
        this.apiUrl = (this.config.get('DEXPAY_API_URL') || DEFAULT_API_URL).replace(/\/+$/, '');
        if (!this.isConfigured()) {
            this.logger.warn('DexPay non configuré (DEXPAY_PUBLIC_KEY / DEXPAY_SECRET_KEY) : paiements désactivés');
        }
        else {
            this.logger.log(`DexPay configuré en mode ${this.isTestMode() ? 'TEST' : 'PRODUCTION'}`);
        }
    }
    isConfigured() {
        return !!this.publicKey && !!this.secretKey;
    }
    isTestMode() {
        return this.publicKey.startsWith('pk_test_');
    }
    async createCheckoutSession(params) {
        if (!this.isConfigured()) {
            throw new common_1.ServiceUnavailableException('Le paiement en ligne n\'est pas configuré');
        }
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/checkout-sessions`, {
                reference: params.reference,
                item_name: params.itemName,
                amount: params.amount,
                currency: params.currency,
                success_url: params.successUrl,
                failure_url: params.failureUrl,
                ...(params.webhookUrl && { webhook_url: params.webhookUrl }),
                is_one_shot_payment: true,
                metadata: params.metadata ?? {},
            }, {
                headers: { 'x-api-key': this.publicKey, 'Content-Type': 'application/json' },
                timeout: HTTP_TIMEOUT_MS,
            });
            const data = response.data?.data ?? {};
            const paymentUrl = data.payment_url ?? data.sandbox_payment_url;
            if (!paymentUrl)
                throw new Error('Réponse DexPay sans payment_url');
            this.logger.log(`Session de paiement créée : ${params.reference}`);
            return { reference: data.reference ?? params.reference, payment_url: paymentUrl, status: data.status ?? 'initiated' };
        }
        catch (error) {
            const status = error.response?.status;
            this.logger.error(`Création de session DexPay refusée (${status ?? 'réseau'}) pour ${params.reference} : ` +
                JSON.stringify(error.response?.data?.errors ?? error.response?.data?.message ?? error.message));
            throw new common_1.BadGatewayException('Le service de paiement est indisponible, réessayez dans un instant');
        }
    }
    async getCheckoutSession(reference) {
        if (!this.isConfigured())
            return null;
        const response = await axios_1.default.get(`${this.apiUrl}/checkout-sessions/${encodeURIComponent(reference)}`, {
            headers: { 'x-api-key': this.publicKey },
            timeout: HTTP_TIMEOUT_MS,
        });
        return response.data?.data ?? null;
    }
    verifyWebhookSignature(signature, rawBody) {
        if (!this.secretKey) {
            this.logger.error('DEXPAY_SECRET_KEY non configurée : webhook refusé');
            return false;
        }
        if (!signature || !rawBody) {
            this.logger.warn('Webhook sans signature ou sans corps : refusé');
            return false;
        }
        const expected = (0, crypto_1.createHmac)('sha256', this.secretKey).update(rawBody).digest('hex');
        const received = signature.trim().toLowerCase();
        const a = Buffer.from(expected, 'utf8');
        const b = Buffer.from(received, 'utf8');
        const valid = a.length === b.length && (0, crypto_1.timingSafeEqual)(a, b);
        if (!valid)
            this.logger.warn('Signature de webhook invalide : refusé');
        return valid;
    }
};
exports.DexpayService = DexpayService;
exports.DexpayService = DexpayService = DexpayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DexpayService);
//# sourceMappingURL=dexpay.service.js.map