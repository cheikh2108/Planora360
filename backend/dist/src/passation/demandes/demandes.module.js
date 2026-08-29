"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandesModule = void 0;
const common_1 = require("@nestjs/common");
const demandes_service_1 = require("./demandes.service");
const demandes_controller_1 = require("./demandes.controller");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const common_passation_module_1 = require("../common/common-passation.module");
let DemandesModule = class DemandesModule {
};
exports.DemandesModule = DemandesModule;
exports.DemandesModule = DemandesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, common_passation_module_1.CommonPassationModule],
        controllers: [demandes_controller_1.DemandesController],
        providers: [demandes_service_1.DemandesService],
        exports: [demandes_service_1.DemandesService],
    })
], DemandesModule);
//# sourceMappingURL=demandes.module.js.map