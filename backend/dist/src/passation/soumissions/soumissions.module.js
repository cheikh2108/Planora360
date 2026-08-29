"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoumissionsModule = void 0;
const common_1 = require("@nestjs/common");
const soumissions_service_1 = require("./soumissions.service");
const soumissions_controller_1 = require("./soumissions.controller");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const common_passation_module_1 = require("../common/common-passation.module");
let SoumissionsModule = class SoumissionsModule {
};
exports.SoumissionsModule = SoumissionsModule;
exports.SoumissionsModule = SoumissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, common_passation_module_1.CommonPassationModule],
        controllers: [soumissions_controller_1.SoumissionsController],
        providers: [soumissions_service_1.SoumissionsService],
        exports: [soumissions_service_1.SoumissionsService],
    })
], SoumissionsModule);
//# sourceMappingURL=soumissions.module.js.map