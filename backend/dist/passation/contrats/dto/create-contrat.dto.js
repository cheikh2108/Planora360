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
exports.CreateContratDto = void 0;
const class_validator_1 = require("class-validator");
class CreateContratDto {
    procedureId;
    fournisseurId;
    montantInitial;
    dateSignature;
    dateEcheance;
    soumissionId;
    montantRevise;
    dateDemarrage;
    dateReceptionProv;
    dateReceptionDef;
    modalitesAvance;
    modalitesAcompte;
    modalitesRetenue;
    garanties;
    devise;
}
exports.CreateContratDto = CreateContratDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'ID de la procédure est obligatoire' }),
    __metadata("design:type", String)
], CreateContratDto.prototype, "procedureId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'ID du fournisseur est obligatoire' }),
    __metadata("design:type", String)
], CreateContratDto.prototype, "fournisseurId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'Le montant initial doit être un nombre avec maximum 2 décimales' }),
    (0, class_validator_1.Min)(0, { message: 'Le montant initial doit être positif' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le montant initial est obligatoire' }),
    __metadata("design:type", Number)
], CreateContratDto.prototype, "montantInitial", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Date de signature invalide (format ISO attendu)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La date de signature est obligatoire' }),
    __metadata("design:type", String)
], CreateContratDto.prototype, "dateSignature", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Date d\'échéance invalide (format ISO attendu)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La date d\'échéance est obligatoire' }),
    __metadata("design:type", String)
], CreateContratDto.prototype, "dateEcheance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "soumissionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateContratDto.prototype, "montantRevise", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "dateDemarrage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "dateReceptionProv", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "dateReceptionDef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "modalitesAvance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "modalitesAcompte", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "modalitesRetenue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "garanties", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContratDto.prototype, "devise", void 0);
//# sourceMappingURL=create-contrat.dto.js.map