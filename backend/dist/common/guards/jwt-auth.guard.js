"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
exports.isSubscriptionExpired = isSubscriptionExpired;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("./roles.guard");
const OPEN_WHEN_EXPIRED = /^\/(api\/)?(auth|billing|dexpay)(\/|$)/;
function isSubscriptionExpired(org, now = new Date()) {
    if (!org?.currentPeriodEnd || org.subscriptionPlan === 'ENTERPRISE')
        return false;
    return new Date(org.currentPeriodEnd).getTime() <= now.getTime();
}
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    async canActivate(context) {
        const ok = (await super.canActivate(context));
        if (!ok)
            return false;
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (user && !(0, roles_guard_1.isSuperAdmin)(user) && isSubscriptionExpired(user.organization)) {
            const path = (req.originalUrl ?? req.url ?? '').split('?')[0];
            if (!OPEN_WHEN_EXPIRED.test(path)) {
                const until = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
                    .format(new Date(user.organization.currentPeriodEnd));
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.PAYMENT_REQUIRED,
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: `Votre abonnement a expiré le ${until}. Renouvelez-le pour continuer à utiliser PLANORA 360.`,
                }, common_1.HttpStatus.PAYMENT_REQUIRED);
            }
        }
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map