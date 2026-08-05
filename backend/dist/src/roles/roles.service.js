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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, callerRole) {
        const isSuperAdmin = callerRole === 'Super administrateur';
        return this.prisma.role.findMany({
            where: {
                OR: [
                    { organizationId },
                    { organizationId: null },
                ],
                ...(isSuperAdmin ? {} : { NOT: { name: 'Super administrateur' } }),
            },
            orderBy: [{ organizationId: 'asc' }, { name: 'asc' }],
            include: { _count: { select: { users: true } } },
        });
    }
    async findOne(id, organizationId) {
        const role = await this.prisma.role.findFirst({
            where: {
                id,
                OR: [{ organizationId }, { organizationId: null }],
            },
            include: { _count: { select: { users: true } } },
        });
        if (!role)
            throw new common_1.NotFoundException('Rôle introuvable');
        return role;
    }
    async create(dto, organizationId) {
        const existing = await this.prisma.role.findFirst({
            where: { organizationId, name: dto.name },
        });
        if (existing)
            throw new common_1.ConflictException('Un rôle avec ce nom existe déjà');
        return this.prisma.role.create({
            data: {
                organizationId,
                name: dto.name,
                permissions: dto.permissions,
            },
        });
    }
    async update(id, dto, organizationId) {
        const role = await this.prisma.role.findFirst({ where: { id } });
        if (!role)
            throw new common_1.NotFoundException('Rôle introuvable');
        if (role.organizationId === null) {
            throw new common_1.ForbiddenException('Les rôles système ne peuvent pas être modifiés');
        }
        if (role.organizationId !== organizationId) {
            throw new common_1.ForbiddenException('Ce rôle n\'appartient pas à votre organisation');
        }
        if (dto.name) {
            const conflict = await this.prisma.role.findFirst({
                where: { organizationId, name: dto.name, id: { not: id } },
            });
            if (conflict)
                throw new common_1.ConflictException('Un rôle avec ce nom existe déjà');
        }
        return this.prisma.role.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.permissions && { permissions: dto.permissions }),
            },
        });
    }
    async remove(id, organizationId) {
        const role = await this.prisma.role.findFirst({ where: { id } });
        if (!role)
            throw new common_1.NotFoundException('Rôle introuvable');
        if (role.organizationId === null) {
            throw new common_1.ForbiddenException('Les rôles système ne peuvent pas être supprimés');
        }
        if (role.organizationId !== organizationId) {
            throw new common_1.ForbiddenException('Ce rôle n\'appartient pas à votre organisation');
        }
        const usersWithRole = await this.prisma.user.count({ where: { roleId: id } });
        if (usersWithRole > 0) {
            throw new common_1.ConflictException(`Ce rôle est assigné à ${usersWithRole} utilisateur(s). Réassignez-les d'abord.`);
        }
        await this.prisma.role.delete({ where: { id } });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map