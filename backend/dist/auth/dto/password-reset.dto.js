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
exports.CheckResetTokenDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = void 0;
const class_validator_1 = require("class-validator");
const change_password_dto_1 = require("./change-password.dto");
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Adresse e-mail invalide' }),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    token;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
    (0, class_validator_1.MaxLength)(128),
    (0, class_validator_1.Matches)(change_password_dto_1.PASSWORD_RULE, { message: 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class CheckResetTokenDto {
    token;
}
exports.CheckResetTokenDto = CheckResetTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CheckResetTokenDto.prototype, "token", void 0);
//# sourceMappingURL=password-reset.dto.js.map