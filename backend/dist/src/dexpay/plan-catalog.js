"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_CURRENCY = exports.PLAN_LABELS = exports.PAYABLE_PLANS = void 0;
exports.isPayablePlan = isPayablePlan;
exports.planPrice = planPrice;
exports.planCatalog = planCatalog;
exports.addPeriod = addPeriod;
const subscription_guard_1 = require("../common/guards/subscription.guard");
exports.PAYABLE_PLANS = ['INDIVIDUEL', 'PRO', 'EQUIPE', 'ORGANISATION'];
const DEFAULT_PRICES = {
    INDIVIDUEL: { MONTHLY: 10_000, YEARLY: 100_000 },
    PRO: { MONTHLY: 25_000, YEARLY: 250_000 },
    EQUIPE: { MONTHLY: 50_000, YEARLY: 500_000 },
    ORGANISATION: { MONTHLY: 100_000, YEARLY: 1_000_000 },
};
exports.PLAN_LABELS = {
    INDIVIDUEL: 'Individuel',
    PRO: 'Pro',
    EQUIPE: 'Équipe',
    ORGANISATION: 'Organisation',
    ENTERPRISE: 'Enterprise',
};
exports.PLAN_CURRENCY = 'XOF';
function isPayablePlan(plan) {
    return exports.PAYABLE_PLANS.includes(plan);
}
function planPrice(plan, cycle, env = process.env) {
    const raw = env[`PRICE_${plan}_${cycle}`];
    if (raw !== undefined && raw.trim() !== '') {
        const value = Number(raw.trim());
        if (Number.isInteger(value) && value > 0)
            return value;
    }
    return DEFAULT_PRICES[plan][cycle];
}
function planCatalog(env = process.env) {
    return Object.keys(exports.PLAN_LABELS).map((plan) => ({
        plan,
        label: exports.PLAN_LABELS[plan],
        payable: isPayablePlan(plan),
        currency: exports.PLAN_CURRENCY,
        prices: isPayablePlan(plan)
            ? { MONTHLY: planPrice(plan, 'MONTHLY', env), YEARLY: planPrice(plan, 'YEARLY', env) }
            : null,
        limits: subscription_guard_1.PLAN_LIMITS[plan],
    }));
}
function addPeriod(start, cycle) {
    const end = new Date(start);
    const day = end.getUTCDate();
    end.setUTCDate(1);
    if (cycle === 'YEARLY')
        end.setUTCFullYear(end.getUTCFullYear() + 1);
    else
        end.setUTCMonth(end.getUTCMonth() + 1);
    const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
    end.setUTCDate(Math.min(day, lastDay));
    return end;
}
//# sourceMappingURL=plan-catalog.js.map