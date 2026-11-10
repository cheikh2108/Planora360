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
exports.CreateDemandeDto = void 0;
const class_validator_1 = require("class-validator");
class CreateDemandeDto {
    objet;
    description;
    justification;
    montantEstimatif;
    quantite;
    specifications;
    ligneBudgetaire;
    sourceFinancement;
    echeanceSouhaitee;
    lignePpmId;
    activityId;
}
exports.CreateDemandeDto = CreateDemandeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "L'objet est obligatoire" }),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "objet", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La justification est obligatoire' }),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "justification", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'Le montant estimatif doit être un nombre' }),
    (0, class_validator_1.Min)(0, { message: 'Le montant estimatif ne peut pas être négatif' }),
    __metadata("design:type", Number)
], CreateDemandeDto.prototype, "montantEstimatif", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDemandeDto.prototype, "quantite", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "specifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "ligneBudgetaire", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "sourceFinancement", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Échéance souhaitée invalide' }),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "echeanceSouhaitee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "lignePpmId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "activityId", void 0);
//# sourceMappingURL=create-demande.dto.js.map