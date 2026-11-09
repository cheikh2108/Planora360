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
exports.SoumissionConfidentialityGuard = void 0;
const common_1 = require("@nestjs/common");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const error_messages_1 = require("../constants/error-messages");
let SoumissionConfidentialityGuard = class SoumissionConfidentialityGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if ((0, roles_guard_1.isSuperAdmin)(user)) {
            return true;
        }
        const procedureId = request.params.procedureId || request.body?.procedureId;
        if (!procedureId) {
            throw new common_1.ForbiddenException('Procédure non spécifiée');
        }
        const procedure = await this.prisma.procedure.findUnique({
            where: { id: procedureId },
            select: {
                id: true,
                dateOuverture: true,
                status: true,
            },
        });
        if (!procedure) {
            throw new common_1.ForbiddenException(error_messages_1.ERROR_MESSAGES.PROCEDURE.NOT_FOUND);
        }
        if (!procedure.dateOuverture) {
            throw new common_1.ForbiddenException(error_messages_1.ERROR_MESSAGES.PROCEDURE.NO_OPENING_DATE);
        }
        const now = new Date();
        const dateOuverture = new Date(procedure.dateOuverture);
        if (now < dateOuverture) {
            throw new common_1.ForbiddenException(error_messages_1.ERROR_MESSAGES.SOUMISSION.CONFIDENTIALITY_BREACH(dateOuverture));
        }
        return true;
    }
};
exports.SoumissionConfidentialityGuard = SoumissionConfidentialityGuard;
exports.SoumissionConfidentialityGuard = SoumissionConfidentialityGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoumissionConfidentialityGuard);
//# sourceMappingURL=soumission-confidentiality.guard.js.map