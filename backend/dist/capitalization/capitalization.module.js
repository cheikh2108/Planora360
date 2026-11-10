"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapitalizationModule = void 0;
const common_1 = require("@nestjs/common");
const capitalization_controller_1 = require("./capitalization.controller");
const capitalization_service_1 = require("./capitalization.service");
const prisma_module_1 = require("../common/prisma/prisma.module");
const storage_module_1 = require("../storage/storage.module");
let CapitalizationModule = class CapitalizationModule {
};
exports.CapitalizationModule = CapitalizationModule;
exports.CapitalizationModule = CapitalizationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, storage_module_1.StorageModule],
        controllers: [capitalization_controller_1.CapitalizationController],
        providers: [capitalization_service_1.CapitalizationService],
        exports: [capitalization_service_1.CapitalizationService],
    })
], CapitalizationModule);
//# sourceMappingURL=capitalization.module.js.map