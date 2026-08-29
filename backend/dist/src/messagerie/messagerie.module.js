"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagerieModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const platform_express_1 = require("@nestjs/platform-express");
const messagerie_service_1 = require("./messagerie.service");
const messagerie_controller_1 = require("./messagerie.controller");
const messagerie_gateway_1 = require("./messagerie.gateway");
const upload_controller_1 = require("./upload.controller");
const prisma_module_1 = require("../common/prisma/prisma.module");
let MessagerieModule = class MessagerieModule {
};
exports.MessagerieModule = MessagerieModule;
exports.MessagerieModule = MessagerieModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '7d' },
            }),
            platform_express_1.MulterModule.register({
                dest: './uploads/messagerie',
            }),
        ],
        controllers: [messagerie_controller_1.MessagerieController, upload_controller_1.UploadController],
        providers: [messagerie_service_1.MessagerieService, messagerie_gateway_1.MessagerieGateway],
        exports: [messagerie_service_1.MessagerieService, messagerie_gateway_1.MessagerieGateway],
    })
], MessagerieModule);
//# sourceMappingURL=messagerie.module.js.map