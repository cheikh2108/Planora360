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
exports.RejectRecommendationDto = exports.ValidateRecommendationDto = exports.ReopenRecommendationDto = exports.SuspendRecommendationDto = exports.ChangeStatusDto = void 0;
const class_validator_1 = require("class-validator");
class ChangeStatusDto {
    status;
    comment;
}
exports.ChangeStatusDto = ChangeStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)([
        'NON_DEMARREE',
        'EN_COURS',
        'PARTIELLEMENT_MISE_EN_OEUVRE',
        'REALISEE_A_VALIDER',
        'SUSPENDUE',
        'VALIDEE',
        'ROUVERTE',
    ]),
    __metadata("design:type", String)
], ChangeStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeStatusDto.prototype, "comment", void 0);
class SuspendRecommendationDto {
    reason;
}
exports.SuspendRecommendationDto = SuspendRecommendationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SuspendRecommendationDto.prototype, "reason", void 0);
class ReopenRecommendationDto {
    reason;
}
exports.ReopenRecommendationDto = ReopenRecommendationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReopenRecommendationDto.prototype, "reason", void 0);
class ValidateRecommendationDto {
    comment;
}
exports.ValidateRecommendationDto = ValidateRecommendationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateRecommendationDto.prototype, "comment", void 0);
class RejectRecommendationDto {
    reason;
}
exports.RejectRecommendationDto = RejectRecommendationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RejectRecommendationDto.prototype, "reason", void 0);
//# sourceMappingURL=change-status.dto.js.map