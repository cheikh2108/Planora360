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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionGuard = exports.PLAN_LIMITS = exports.RequiresPlan = exports.PLAN_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
exports.PLAN_KEY = 'requiredPlan';
const RequiresPlan = (...plans) => (0, common_1.SetMetadata)(exports.PLAN_KEY, plans);
exports.RequiresPlan = RequiresPlan;
const PLAN_RANK = {
    INDIVIDUEL: 0,
    PRO: 1,
    EQUIPE: 2,
    ORGANISATION: 3,
    ENTERPRISE: 4,
};
const PLAN_LIMITS = {
    INDIVIDUEL: { maxUsers: 1, maxPlans: 3 },
    PRO: { maxUsers: 3, maxPlans: 10 },
    EQUIPE: { maxUsers: 10, maxPlans: 25 },
    ORGANISATION: { maxUsers: 25, maxPlans: 50 },
    ENTERPRISE: { maxUsers: 9999, maxPlans: 9999 },
};
exports.PLAN_LIMITS = PLAN_LIMITS;
let SubscriptionGuard = class SubscriptionGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPlans = this.reflector.getAllAndOverride(exports.PLAN_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPlans?.length)
            return true;
        const { user } = context.switchToHttp().getRequest();
        if (!user)
            throw new common_1.ForbiddenException('Accès refusé. Veuillez vous reconnecter.');
        const orgPlan = user.organization?.subscriptionPlan ?? 'INDIVIDUEL';
        const orgRank = PLAN_RANK[orgPlan];
        const hasAccess = requiredPlans.some((p) => orgRank >= PLAN_RANK[p]);
        if (!hasAccess) {
            const planNames = {
                INDIVIDUEL: 'Individuel',
                PRO: 'Pro',
                EQUIPE: 'Équipe',
                ORGANISATION: 'Organisation',
                ENTERPRISE: 'Enterprise',
            };
            throw new common_1.ForbiddenException(`Cette fonctionnalité nécessite la formule ${requiredPlans.map(p => planNames[p]).join(' ou ')}. ` +
                `Votre formule actuelle : ${planNames[orgPlan]}. ` +
                `Passez à une formule supérieure dans Paramètres > Abonnement.`);
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map