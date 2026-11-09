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
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../common/prisma/prisma.service");
const cache_invalidation_service_1 = require("../common/cache/cache-invalidation.service");
const notifications_service_1 = require("../notifications/notifications.service");
const dexpay_service_1 = require("./dexpay.service");
const plan_catalog_1 = require("./plan-catalog");
let BillingService = BillingService_1 = class BillingService {
    prisma;
    dexpay;
    config;
    cacheInvalidation;
    notifications;
    logger = new common_1.Logger(BillingService_1.name);
    constructor(prisma, dexpay, config, cacheInvalidation, notifications) {
        this.prisma = prisma;
        this.dexpay = dexpay;
        this.config = config;
        this.cacheInvalidation = cacheInvalidation;
        this.notifications = notifications;
    }
    plans() {
        return { currency: plan_catalog_1.PLAN_CURRENCY, plans: (0, plan_catalog_1.planCatalog)(), onlinePayment: this.isOnlinePaymentReady() };
    }
    isOnlinePaymentReady() {
        return this.dexpay.isConfigured();
    }
    async subscription(organizationId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                subscriptionPlan: true,
                subscriptionStatus: true,
                billingCycle: true,
                currentPeriodEnd: true,
                nextPaymentDate: true,
                trialEndsAt: true,
            },
        });
        if (!org)
            throw new common_1.NotFoundException('Organisation introuvable');
        const payments = await this.prisma.payment.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                dexpayReference: true, amount: true, currency: true, status: true, plan: true,
                paymentMethod: true, periodStart: true, periodEnd: true, createdAt: true, paidAt: true, metadata: true,
            },
        });
        return {
            ...org,
            onlinePayment: this.isOnlinePaymentReady(),
            payments: payments.map(({ dexpayReference, metadata, ...p }) => ({
                ...p,
                reference: dexpayReference,
                billingCycle: metadata?.billing_cycle ?? null,
            })),
        };
    }
    async startCheckout(organizationId, userId, plan, billingCycle) {
        if (!this.dexpay.isConfigured()) {
            throw new common_1.ServiceUnavailableException('Le paiement en ligne n\'est pas encore disponible. Contactez le support pour changer de formule.');
        }
        const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
        if (!org)
            throw new common_1.NotFoundException('Organisation introuvable');
        if (org.subscriptionPlan === 'ENTERPRISE') {
            throw new common_1.BadRequestException('La formule Enterprise se gère avec l\'équipe PLANORA 360');
        }
        const amount = (0, plan_catalog_1.planPrice)(plan, billingCycle);
        const reference = `PLN-${Date.now().toString(36).toUpperCase()}-${(0, crypto_1.randomBytes)(4).toString('hex').toUpperCase()}`;
        const metadata = { organization_id: organizationId, plan, billing_cycle: billingCycle, requested_by: userId };
        await this.prisma.payment.create({
            data: {
                organizationId,
                dexpayReference: reference,
                amount,
                currency: plan_catalog_1.PLAN_CURRENCY,
                status: 'pending',
                plan: plan,
                metadata,
            },
        });
        const frontendUrl = this.frontendUrl();
        try {
            const session = await this.dexpay.createCheckoutSession({
                reference,
                itemName: `PLANORA 360 - Formule ${plan_catalog_1.PLAN_LABELS[plan]} (${billingCycle === 'YEARLY' ? 'annuel' : 'mensuel'})`,
                amount,
                currency: plan_catalog_1.PLAN_CURRENCY,
                successUrl: `${frontendUrl}/payment/success?ref=${reference}`,
                failureUrl: `${frontendUrl}/payment/failed?ref=${reference}`,
                webhookUrl: this.webhookUrl(),
                metadata,
            });
            return { reference, paymentUrl: session.payment_url, amount, currency: plan_catalog_1.PLAN_CURRENCY };
        }
        catch (error) {
            await this.prisma.payment.update({ where: { dexpayReference: reference }, data: { status: 'failed' } });
            throw error;
        }
    }
    async paymentStatus(organizationId, reference) {
        let payment = await this.prisma.payment.findFirst({ where: { dexpayReference: reference, organizationId } });
        if (!payment)
            throw new common_1.NotFoundException('Paiement introuvable');
        if (payment.status === 'pending') {
            try {
                const session = await this.dexpay.getCheckoutSession(reference);
                const remote = session?.status;
                if (remote === 'completed') {
                    await this.completePayment({ reference, amount: session?.amount, currency: session?.currency });
                }
                else if (remote === 'failed' || remote === 'cancelled') {
                    await this.markPayment(reference, remote);
                }
                payment = (await this.prisma.payment.findUnique({ where: { dexpayReference: reference } }));
            }
            catch {
            }
        }
        return this.publicPayment(payment);
    }
    async completePayment(event) {
        const payment = await this.prisma.payment.findUnique({ where: { dexpayReference: event.reference } });
        if (!payment) {
            this.logger.warn(`Paiement confirmé inconnu : ${event.reference}`);
            return false;
        }
        if (payment.status === 'completed')
            return false;
        const paidAmount = Number(event.amount);
        const paidCurrency = event.currency ?? payment.currency;
        if (event.amount !== undefined && (paidAmount !== payment.amount || paidCurrency !== payment.currency)) {
            await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'amount_mismatch' } });
            this.logger.error(`Paiement ${payment.dexpayReference} : montant reçu ${paidAmount} ${paidCurrency}, attendu ${payment.amount} ${payment.currency}. Formule non activée.`);
            return false;
        }
        const billingCycle = payment.metadata?.billing_cycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
        const applied = await this.prisma.$transaction(async (tx) => {
            const { count } = await tx.payment.updateMany({
                where: { id: payment.id, status: { in: ['pending', 'failed', 'cancelled'] } },
                data: {
                    status: 'completed',
                    paidAt: new Date(),
                    paymentMethod: event.operator ?? event.payment_method ?? null,
                    dexpayCheckoutId: event.checkout_session_id ?? undefined,
                },
            });
            if (count === 0)
                return null;
            const org = await tx.organization.findUniqueOrThrow({ where: { id: payment.organizationId } });
            const now = new Date();
            const extendsCurrent = org.subscriptionPlan === payment.plan &&
                org.subscriptionStatus === 'ACTIVE' &&
                org.currentPeriodEnd !== null &&
                org.currentPeriodEnd > now;
            const periodStart = extendsCurrent ? org.currentPeriodEnd : now;
            const periodEnd = (0, plan_catalog_1.addPeriod)(periodStart, billingCycle);
            await tx.payment.update({ where: { id: payment.id }, data: { periodStart, periodEnd } });
            await tx.organization.update({
                where: { id: payment.organizationId },
                data: {
                    subscriptionPlan: payment.plan,
                    subscriptionStatus: 'ACTIVE',
                    subscriptionCurrency: payment.currency,
                    billingCycle,
                    currentPeriodEnd: periodEnd,
                    nextPaymentDate: periodEnd,
                },
            });
            return { periodEnd, organizationName: org.name };
        });
        if (!applied)
            return false;
        await this.cacheInvalidation.invalidateAll(payment.organizationId);
        this.logger.log(`Formule ${payment.plan} activée pour ${payment.organizationId} jusqu'au ${applied.periodEnd.toISOString()}`);
        await this.sendConfirmation(payment, applied.periodEnd, applied.organizationName);
        return true;
    }
    async markPayment(reference, status) {
        const allowedFrom = status === 'refunded' ? ['completed'] : ['pending'];
        const { count } = await this.prisma.payment.updateMany({
            where: { dexpayReference: reference, status: { in: allowedFrom } },
            data: { status },
        });
        if (count && status === 'refunded') {
            this.logger.warn(`Paiement ${reference} remboursé : vérifier la formule de l'organisation`);
        }
    }
    publicPayment(payment) {
        return {
            reference: payment.dexpayReference,
            status: payment.status,
            plan: payment.plan,
            amount: payment.amount,
            currency: payment.currency,
            billingCycle: payment.metadata?.billing_cycle ?? null,
            periodEnd: payment.periodEnd,
            paidAt: payment.paidAt,
        };
    }
    async sendConfirmation(payment, periodEnd, organizationName) {
        const requestedBy = payment.metadata?.requested_by;
        const recipient = await this.prisma.user.findFirst({
            where: requestedBy
                ? { id: requestedBy, organizationId: payment.organizationId, deletedAt: null }
                : { organizationId: payment.organizationId, deletedAt: null },
            orderBy: { createdAt: 'asc' },
            select: { email: true, firstName: true },
        });
        if (!recipient)
            return;
        try {
            await this.notifications.sendPaymentConfirmation({
                email: recipient.email,
                firstName: recipient.firstName,
                organizationName,
                planLabel: plan_catalog_1.PLAN_LABELS[payment.plan],
                amount: payment.amount,
                currency: payment.currency,
                reference: payment.dexpayReference,
                periodEnd,
            });
        }
        catch (error) {
            this.logger.error(`E-mail de confirmation non envoyé (${payment.dexpayReference}) : ${error}`);
        }
    }
    webhookUrl() {
        const raw = this.config.get('API_PUBLIC_URL')?.trim();
        if (!raw) {
            this.logger.warn('API_PUBLIC_URL non définie : paiement sans webhook (activation au retour sur la page de succès)');
            return undefined;
        }
        return `${raw.replace(/\/+$/, '').replace(/\/api$/, '')}/api/dexpay/webhook`;
    }
    frontendUrl() {
        const raw = this.config.get('FRONTEND_URL') || 'http://localhost:3001';
        return raw.split(',')[0].trim().replace(/\/+$/, '');
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        dexpay_service_1.DexpayService,
        config_1.ConfigService,
        cache_invalidation_service_1.CacheInvalidationService,
        notifications_service_1.NotificationsService])
], BillingService);
//# sourceMappingURL=billing.service.js.map