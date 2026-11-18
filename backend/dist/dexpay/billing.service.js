"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcryptjs"));
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
    async startCheckout(organizationId, userId, plan, billingCycle, options = {}) {
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
        const metadata = {
            organization_id: organizationId,
            plan,
            billing_cycle: billingCycle,
            requested_by: userId,
            ...(options.registration ? { registration: true } : {}),
        };
        const signup = options.registration ? '&signup=1' : '';
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
                successUrl: `${frontendUrl}/payment/success?ref=${reference}${signup}`,
                failureUrl: `${frontendUrl}/payment/failed?ref=${reference}${signup}`,
                webhookUrl: this.webhookUrl(),
                metadata: Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)])),
            });
            return { reference, paymentUrl: session.payment_url, amount, currency: plan_catalog_1.PLAN_CURRENCY };
        }
        catch (error) {
            await this.prisma.payment.update({ where: { dexpayReference: reference }, data: { status: 'failed' } });
            throw error;
        }
    }
    async paymentStatus(organizationId, reference) {
        const payment = await this.prisma.payment.findFirst({ where: { dexpayReference: reference, organizationId } });
        if (!payment)
            throw new common_1.NotFoundException('Paiement introuvable');
        return this.publicPayment(await this.refreshPending(payment));
    }
    async refreshPending(payment) {
        if (payment.status !== 'pending')
            return payment;
        const reference = payment.dexpayReference;
        try {
            const session = await this.dexpay.getCheckoutSession(reference);
            const remote = session?.status;
            if (remote === 'completed') {
                await this.completePayment({ reference, amount: session?.amount, currency: session?.currency });
            }
            else if (remote === 'failed' || remote === 'cancelled') {
                await this.markPayment(reference, remote);
            }
            return (await this.prisma.payment.findUnique({ where: { dexpayReference: reference } }));
        }
        catch {
            return payment;
        }
    }
    async findSignupPayment(reference) {
        const payment = await this.prisma.payment.findUnique({ where: { dexpayReference: reference } });
        if (!payment || payment.metadata?.registration !== true) {
            throw new common_1.NotFoundException('Paiement introuvable');
        }
        return payment;
    }
    async signupPaymentStatus(reference) {
        const payment = await this.refreshPending(await this.findSignupPayment(reference));
        const { reference: ref, status, plan, amount, currency, billingCycle } = this.publicPayment(payment);
        return { reference: ref, status, plan, amount, currency, billingCycle };
    }
    async retrySignupPayment(reference) {
        const payment = await this.findSignupPayment(reference);
        const org = await this.prisma.organization.findUnique({ where: { id: payment.organizationId } });
        if (!org || org.deletedAt || org.status !== 'PENDING_PAYMENT') {
            throw new common_1.BadRequestException('Ce compte est déjà activé : connectez-vous avec les identifiants reçus par e-mail.');
        }
        const meta = payment.metadata;
        const billingCycle = meta?.billing_cycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
        return this.startCheckout(org.id, meta?.requested_by, payment.plan, billingCycle, {
            registration: true,
        });
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
            const activatesRegistration = org.status === 'PENDING_PAYMENT';
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
                    ...(activatesRegistration ? { status: 'ACTIVE' } : {}),
                },
            });
            return { periodEnd, organizationName: org.name, activatesRegistration };
        });
        if (!applied)
            return false;
        await this.cacheInvalidation.invalidateAll(payment.organizationId);
        this.logger.log(`Formule ${payment.plan} activée pour ${payment.organizationId} jusqu'au ${applied.periodEnd.toISOString()}`);
        if (applied.activatesRegistration) {
            await this.activateRegistrationAccount(payment, applied.organizationName, billingCycle);
        }
        await this.sendConfirmation(payment, applied.periodEnd, applied.organizationName);
        return true;
    }
    async activateRegistrationAccount(payment, organizationName, billingCycle) {
        const user = await this.prisma.user.findFirst({
            where: { organizationId: payment.organizationId, deletedAt: null },
            orderBy: { createdAt: 'asc' },
        });
        if (!user)
            return;
        const tempPassword = (0, crypto_1.randomBytes)(8).toString('base64url').slice(0, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isActive: true,
                passwordHash: await bcrypt.hash(tempPassword, 12),
                mustChangePassword: true,
                tokensValidAfter: new Date(),
            },
        });
        try {
            await this.notifications.sendWelcomeCredentials({
                email: user.email,
                firstName: user.firstName,
                orgName: organizationName,
                tempPassword,
            });
        }
        catch (error) {
            this.logger.error(`Identifiants non envoyés à l'inscription ${payment.organizationId} : ${error}`);
        }
        try {
            await this.notifications.sendPaidSignupToSupport({
                organizationName,
                organizationId: payment.organizationId,
                planLabel: plan_catalog_1.PLAN_LABELS[payment.plan],
                billingCycle,
                amount: payment.amount,
                currency: payment.currency,
                userEmail: user.email,
                userName: `${user.firstName} ${user.lastName}`,
            });
        }
        catch (error) {
            this.logger.error(`Support non prévenu de l'inscription ${payment.organizationId} : ${error}`);
        }
    }
    async sendRenewalReminders(now = new Date()) {
        const day = 24 * 3600 * 1000;
        const windows = [
            { kind: 'J7', from: new Date(now.getTime() + 6 * day), to: new Date(now.getTime() + 7 * day) },
            { kind: 'J1', from: now, to: new Date(now.getTime() + day) },
            { kind: 'EXPIRED', from: new Date(now.getTime() - day), to: now },
        ];
        let sent = 0;
        for (const w of windows) {
            const orgs = await this.prisma.organization.findMany({
                where: {
                    deletedAt: null,
                    status: 'ACTIVE',
                    subscriptionPlan: { not: 'ENTERPRISE' },
                    currentPeriodEnd: { gt: w.from, lte: w.to },
                },
                select: { id: true, name: true, subscriptionPlan: true, currentPeriodEnd: true },
            });
            for (const org of orgs) {
                if (w.kind === 'EXPIRED') {
                    await this.prisma.organization.update({ where: { id: org.id }, data: { subscriptionStatus: 'PAST_DUE' } });
                    await this.cacheInvalidation.invalidateAll(org.id);
                }
                const admins = await this.prisma.user.findMany({
                    where: { organizationId: org.id, deletedAt: null, isActive: true, role: { name: 'Administrateur' } },
                    select: { email: true, firstName: true },
                });
                for (const admin of admins) {
                    try {
                        await this.notifications.sendSubscriptionReminder({
                            email: admin.email,
                            firstName: admin.firstName,
                            organizationName: org.name,
                            planLabel: plan_catalog_1.PLAN_LABELS[org.subscriptionPlan],
                            periodEnd: org.currentPeriodEnd,
                            kind: w.kind,
                            renewUrl: `${this.frontendUrl()}/payment/renew`,
                        });
                        sent += 1;
                    }
                    catch (error) {
                        this.logger.error(`Relance d'échéance non envoyée (${org.id}) : ${error}`);
                    }
                }
            }
        }
        return sent;
    }
    async purgeUnpaidRegistrations(now = new Date()) {
        const cutoff = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        const stale = await this.prisma.organization.findMany({
            where: { status: 'PENDING_PAYMENT', createdAt: { lt: cutoff }, payments: { none: { status: 'completed' } } },
            select: { id: true },
        });
        for (const { id } of stale) {
            await this.prisma.$transaction([
                this.prisma.payment.deleteMany({ where: { organizationId: id } }),
                this.prisma.user.deleteMany({ where: { organizationId: id } }),
                this.prisma.organization.delete({ where: { id } }),
            ]);
        }
        return stale.length;
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