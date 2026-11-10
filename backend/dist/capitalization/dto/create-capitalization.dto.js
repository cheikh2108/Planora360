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
exports.CreateCapitalizationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCapitalizationDto {
    type;
    title;
    context;
    challenges;
    solutions;
    results;
    lessons;
    tags;
    status;
}
exports.CreateCapitalizationDto = CreateCapitalizationDto;
__decorate([
    (0, class_validator_1.IsEnum)(['BONNE_PRATIQUE', 'RECIT_CHANGEMENT', 'GUIDE']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "context", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "challenges", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "solutions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "results", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "lessons", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCapitalizationDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['BROUILLON', 'PUBLIE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCapitalizationDto.prototype, "status", void 0);
//# sourceMappingURL=create-capitalization.dto.js.map