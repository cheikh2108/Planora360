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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DexpayController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexpayController = void 0;
const common_1 = require("@nestjs/common");
const dexpay_service_1 = require("./dexpay.service");
const prisma_service_1 = require("../common/prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let DexpayController = DexpayController_1 = class DexpayController {
    dexpay;
    prisma;
    notifications;
    logger = new common_1.Logger(DexpayController_1.name);
    constructor(dexpay, prisma, notifications) {
        this.dexpay = dexpay;
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async handleWebhook(signature, payload) {
        this.logger.log(`📥 Webhook reçu: ${payload.event}`);
        const isValid = this.dexpay.verifyWebhookSignature(signature, payload);
        if (!isValid) {
            this.logger.error('❌ Signature webhook invalide');
            throw new common_1.BadRequestException('Invalid signature');
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
        }
        catch (error) {
            this.logger.error(`❌ Erreur traitement webhook: ${error.message}`);
            throw error;
        }
        return { received: true };
    }
    async checkPaymentStatus(reference) {
        const session = await this.dexpay.getCheckoutSession(reference);
        return { status: session.status, data: session };
    }
    async handleCheckoutCompleted(data) {
        this.logger.log(`✅ Paiement réussi: ${data.reference}`);
        const { reference, amount, currency, customer, metadata, payment_method } = data;
        const organizationId = metadata?.organization_id;
        const plan = metadata?.plan;
        if (!organizationId) {
            this.logger.error('❌ organization_id manquant dans metadata');
            return;
        }
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
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        await this.prisma.organization.update({
            where: { id: organizationId },
            data: {
                subscriptionPlan: plan,
                subscriptionStatus: 'ACTIVE',
                subscriptionCurrency: currency,
                currentPeriodEnd: periodEnd,
                nextPaymentDate: periodEnd,
                status: 'PENDING_VERIFICATION',
            },
        });
        const token = this.generateToken();
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24);
        await this.prisma.organization.update({
            where: { id: organizationId },
            data: {
                emailVerificationToken: token,
                emailVerificationExpiry: tokenExpiry,
            },
        });
        const admin = await this.prisma.user.findFirst({
            where: { organizationId, deletedAt: null },
            orderBy: { createdAt: 'asc' },
        });
        if (admin) {
            await this.notifications.sendEmailVerification({
                email: admin.email,
                firstName: admin.firstName,
                token,
            });
        }
        this.logger.log(`✅ Organisation ${organizationId} mise à jour, email envoyé`);
    }
    async handleCheckoutFailed(data) {
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
    async handleCheckoutCancelled(data) {
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
    generateToken() {
        const { randomBytes } = require('crypto');
        return randomBytes(32).toString('hex');
    }
};
exports.DexpayController = DexpayController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('X-Webhook-Signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DexpayController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('status/:reference'),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DexpayController.prototype, "checkPaymentStatus", null);
exports.DexpayController = DexpayController = DexpayController_1 = __decorate([
    (0, common_1.Controller)('dexpay'),
    __metadata("design:paramtypes", [dexpay_service_1.DexpayService,
        prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], DexpayController);
//# sourceMappingURL=dexpay.controller.js.map