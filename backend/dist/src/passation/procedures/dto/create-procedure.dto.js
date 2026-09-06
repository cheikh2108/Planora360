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
exports.CreateProcedureDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateProcedureDto {
    methode;
    objet;
    description;
    montantEstimatif;
    lignePpmId;
    datePublication;
    dateLimite;
    dateOuverture;
    dateClarification;
}
exports.CreateProcedureDto = CreateProcedureDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.MethodeProcedure, {
        message: 'Méthode de procédure invalide. Valeurs acceptées : AOO, AOR, DC, GRG, AON, AOI',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La méthode de passation est obligatoire' }),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "methode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'objet de la procédure est obligatoire' }),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "objet", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La description est obligatoire' }),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'Le montant estimatif doit être un nombre avec maximum 2 décimales' }),
    (0, class_validator_1.Min)(0, { message: 'Le montant estimatif doit être positif' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le montant estimatif est obligatoire' }),
    __metadata("design:type", Number)
], CreateProcedureDto.prototype, "montantEstimatif", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "lignePpmId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Date de publication invalide' }),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "datePublication", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Date limite invalide' }),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "dateLimite", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Date d\'ouverture invalide' }),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "dateOuverture", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Date de clarification invalide' }),
    __metadata("design:type", String)
], CreateProcedureDto.prototype, "dateClarification", void 0);
//# sourceMappingURL=create-procedure.dto.js.map