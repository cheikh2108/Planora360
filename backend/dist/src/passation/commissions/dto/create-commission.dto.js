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
exports.AddMembreDto = exports.MEMBRE_ROLES = exports.CreateCommissionDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCommissionDto {
    procedureId;
    nom;
    type;
    dateSeance;
    presidentId;
}
exports.CreateCommissionDto = CreateCommissionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "procedureId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le nom de la commission est obligatoire' }),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "nom", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le type de commission est obligatoire' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Date de séance invalide' }),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "dateSeance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "presidentId", void 0);
exports.MEMBRE_ROLES = ['PRESIDENT', 'RAPPORTEUR', 'MEMBRE', 'OBSERVATEUR', 'EXPERT'];
class AddMembreDto {
    userId;
    role;
}
exports.AddMembreDto = AddMembreDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddMembreDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.MEMBRE_ROLES, { message: `Rôle invalide (${exports.MEMBRE_ROLES.join(', ')})` }),
    __metadata("design:type", String)
], AddMembreDto.prototype, "role", void 0);
//# sourceMappingURL=create-commission.dto.js.map