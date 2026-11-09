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
const billing_service_1 = require("./billing.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DexpayController = DexpayController_1 = class DexpayController {
    dexpay;
    billing;
    logger = new common_1.Logger(DexpayController_1.name);
    constructor(dexpay, billing) {
        this.dexpay = dexpay;
        this.billing = billing;
    }
    async handleWebhook(req, signature, eventHeader) {
        if (!this.dexpay.verifyWebhookSignature(signature, req.rawBody)) {
            throw new common_1.BadRequestException('Signature invalide');
        }
        const body = req.body ?? {};
        const event = body.event ?? eventHeader;
        const reference = body.reference;
        if (!event || typeof reference !== 'string' || !reference) {
            throw new common_1.BadRequestException('Événement incomplet');
        }
        this.logger.log(`Webhook DexPay : ${event} (${reference})`);
        switch (event) {
            case 'checkout.completed':
                await this.billing.completePayment({
                    reference,
                    amount: body.amount,
                    currency: body.currency,
                    payment_method: body.payment_method,
                    operator: body.operator,
                    transaction_id: body.transaction_id,
                    checkout_session_id: body.checkout_session_id,
                });
                break;
            case 'checkout.failed':
                await this.billing.markPayment(reference, 'failed');
                break;
            case 'checkout.cancelled':
                await this.billing.markPayment(reference, 'cancelled');
                break;
            case 'checkout.refunded':
                await this.billing.markPayment(reference, 'refunded');
                break;
            default:
                break;
        }
        return { received: true };
    }
    checkPaymentStatus(reference, user) {
        return this.billing.paymentStatus(user.organizationId, reference);
    }
};
exports.DexpayController = DexpayController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-webhook-signature')),
    __param(2, (0, common_1.Headers)('x-webhook-event')),
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
    __metadata("design:returntype", void 0)
], DexpayController.prototype, "checkPaymentStatus", null);
exports.DexpayController = DexpayController = DexpayController_1 = __decorate([
    (0, common_1.Controller)('dexpay'),
    __metadata("design:paramtypes", [dexpay_service_1.DexpayService,
        billing_service_1.BillingService])
], DexpayController);
//# sourceMappingURL=dexpay.controller.js.map