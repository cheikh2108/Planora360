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
exports.UpdateRecommendationDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateRecommendationDto {
    title;
    description;
    source;
    sourceReference;
    sourceDocumentUrl;
    actionPlanId;
    activityId;
    issuedAt;
    dueDate;
    responsibleId;
    validatorId;
    priority;
    status;
    progress;
}
exports.UpdateRecommendationDto = UpdateRecommendationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([
        'MISSION_SUPERVISION',
        'VISITE_TERRAIN',
        'AUDIT_INTERNE',
        'AUDIT_EXTERNE',
        'EVALUATION_PROJET',
        'EVALUATION_PROGRAMME',
        'REUNION_COORDINATION',
        'REVUE_PERFORMANCE',
        'CONTROLE_INTERNE',
        'CONTROLE_QUALITE',
        'REVUE_BUDGETAIRE',
        'REVUE_FINANCIERE',
        'OBSERVATION_BAILLEUR',
        'OBSERVATION_PARTENAIRE',
        'REVUE_GOUVERNANCE',
        'INSPECTION',
        'REVUE_DOCUMENTAIRE',
        'VERIFICATION_CONFORMITE',
        'AUTRE',
    ]),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "sourceReference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "sourceDocumentUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "actionPlanId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "activityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "issuedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "responsibleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "validatorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['CRITIQUE', 'ELEVEE', 'MOYENNE', 'FAIBLE']),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([
        'NON_DEMARREE',
        'EN_COURS',
        'PARTIELLEMENT_MISE_EN_OEUVRE',
        'REALISEE_A_VALIDER',
        'EN_RETARD',
        'SUSPENDUE',
        'VALIDEE',
        'ROUVERTE',
    ]),
    __metadata("design:type", String)
], UpdateRecommendationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateRecommendationDto.prototype, "progress", void 0);
//# sourceMappingURL=update-recommendation.dto.js.map