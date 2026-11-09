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
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const dexpay_service_1 = require("./dexpay.service");
const prisma_service_1 = require("../common/prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const PLANS = Object.values(client_1.SubscriptionPlan);
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
    async handleWebhook(req, webhookSignature, dexchangeSignature) {
        const signature = webhookSignature ?? dexchangeSignature;
        if (!this.dexpay.verifyWebhookSignature(signature, req.rawBody)) {
            throw new common_1.BadRequestException('Signature invalide');
        }
        const payload = req.body ?? {};
        const { event, data } = payload;
        if (!event || !data?.reference) {
            throw new common_1.BadRequestException('Événement incomplet');
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
    async checkPaymentStatus(reference, user) {
        const payment = await this.prisma.payment.findFirst({
            where: { dexpayReference: reference, organizationId: user.organizationId },
        });
        if (!payment)
            throw new common_1.NotFoundException('Paiement introuvable');
        try {
            const session = await this.dexpay.getCheckoutSession(reference);
            return { status: session?.status ?? payment.status, payment };
        }
        catch {
            if (payment.status)
                return { status: payment.status, payment };
            throw new common_1.BadGatewayException('Service de paiement indisponible');
        }
    }
    async handleCheckoutCompleted(data) {
        const organizationId = data.metadata?.organization_id;
        const plan = data.metadata?.plan;
        if (!organizationId || !plan || !PLANS.includes(plan)) {
            throw new common_1.BadRequestException('Métadonnées de paiement invalides');
        }
        const organization = await this.prisma.organization.findUnique({ where: { id: organizationId } });
        if (!organization)
            throw new common_1.BadRequestException('Organisation inconnue');
        const already = await this.prisma.payment.findUnique({ where: { dexpayReference: data.reference } });
        if (already?.status === 'completed') {
            this.logger.log(`↩️ Paiement ${data.reference} déjà traité`);
            return;
        }
        await this.recordPayment(data, 'completed');
        const periodEnd = new Date();
        if (organization.billingCycle === 'YEARLY')
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.organization.update({
            where: { id: organizationId },
            data: {
                subscriptionPlan: plan,
                subscriptionStatus: 'ACTIVE',
                subscriptionCurrency: data.currency ?? organization.subscriptionCurrency,
                currentPeriodEnd: periodEnd,
                nextPaymentDate: periodEnd,
                status: 'PENDING_VERIFICATION',
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
    async recordPayment(data, status) {
        const organizationId = data.metadata?.organization_id;
        if (!organizationId)
            return;
        const exists = await this.prisma.organization.count({ where: { id: organizationId } });
        if (!exists)
            return;
        const plan = PLANS.includes(data.metadata?.plan) ? data.metadata.plan : null;
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
        if (!plan)
            return;
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
};
exports.DexpayController = DexpayController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-webhook-signature')),
    __param(2, (0, common_1.Headers)('x-dexchange-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DexpayController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('status/:reference'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reference')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DexpayController.prototype, "checkPaymentStatus", null);
exports.DexpayController = DexpayController = DexpayController_1 = __decorate([
    (0, common_1.Controller)('dexpay'),
    __metadata("design:paramtypes", [dexpay_service_1.DexpayService,
        prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], DexpayController);
//# sourceMappingURL=dexpay.controller.js.map