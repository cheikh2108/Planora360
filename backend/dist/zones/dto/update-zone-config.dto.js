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
exports.UpdateZoneConfigDto = void 0;
const class_validator_1 = require("class-validator");
const zone_presets_1 = require("../constants/zone-presets");
class UpdateZoneConfigDto {
    preset;
    levelLabels;
    description;
}
exports.UpdateZoneConfigDto = UpdateZoneConfigDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(zone_presets_1.ZONE_PRESET_LIST, {
        message: `Le preset doit être l'un de: ${zone_presets_1.ZONE_PRESET_LIST.join(', ')}`,
    }),
    __metadata("design:type", String)
], UpdateZoneConfigDto.prototype, "preset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateZoneConfigDto.prototype, "levelLabels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateZoneConfigDto.prototype, "description", void 0);
//# sourceMappingURL=update-zone-config.dto.js.map