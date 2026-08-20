"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const subscription_guard_1 = require("../common/guards/subscription.guard");
const auth_constants_1 = require("../common/constants/auth.constants");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actorOrganizationId, actorRole) {
        const orgId = this.resolveOrganizationId(dto.organizationId, actorOrganizationId, actorRole);
        await this.validateEmailUniqueness(dto.email);
        const role = await this.validateRole(dto.roleId, actorRole);
        await this.validateUserLimit(orgId);
        const user = await this.createUser(dto, orgId);
        return this.sanitizeUserResponse(user);
    }
    resolveOrganizationId(dtoOrganizationId, actorOrganizationId, actorRole) {
        return actorRole === auth_constants_1.ROLE_SUPER_ADMIN && dtoOrganizationId
            ? dtoOrganizationId
            : actorOrganizationId;
    }
    async validateEmailUniqueness(email) {
        const existing = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (existing)
            throw new common_1.ConflictException('Cet email est déjà utilisé');
    }
    async validateRole(roleId, actorRole) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role)
            throw new common_1.NotFoundException('Rôle introuvable');
        if (actorRole !== auth_constants_1.ROLE_SUPER_ADMIN && role.name === auth_constants_1.ROLE_SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Vous ne pouvez pas créer un super admin');
        }
        return role;
    }
    async validateUserLimit(organizationId) {
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { subscriptionPlan: true },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organisation introuvable');
        const currentUserCount = await this.prisma.user.count({
            where: { organizationId, deletedAt: null },
        });
        const planLimit = subscription_guard_1.PLAN_LIMITS[organization.subscriptionPlan];
        if (currentUserCount >= planLimit.maxUsers) {
            throw new common_1.BadRequestException(`Limite d'utilisateurs atteinte pour votre formule ${organization.subscriptionPlan}. ` +
                `Maximum autorisé : ${planLimit.maxUsers} utilisateurs. ` +
                `Passez à une formule supérieure pour ajouter plus d'utilisateurs.`);
        }
    }
    async createUser(dto, organizationId) {
        const passwordHash = await this.hashPassword(dto.password);
        return this.prisma.user.create({
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                passwordHash,
                organizationId,
                roleId: dto.roleId,
                mustChangePassword: true,
            },
            include: { role: true },
        });
    }
    async hashPassword(password) {
        return bcrypt.hash(password, auth_constants_1.BCRYPT_SALT_ROUNDS);
    }
    sanitizeUserResponse(user) {
        const { passwordHash: _, twoFactorSecret: __, isTwoFactorEnabled, ...rest } = user;
        return {
            ...rest,
            twoFactorEnabled: isTwoFactorEnabled,
        };
    }
    async findUsersForAssignment(organizationId) {
        return this.prisma.user.findMany({
            where: {
                organizationId,
                isActive: true,
                deletedAt: null,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { firstName: 'asc' },
                { lastName: 'asc' },
            ],
        });
    }
    async findAll(organizationId, page = 1, limit = 20) {
        const where = { organizationId, deletedAt: null };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: { role: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users.map((user) => this.sanitizeUserResponse(user)),
            total,
            page,
            limit,
        };
    }
    async getStats(organizationId) {
        const where = { organizationId, deletedAt: null };
        const [total, activeCount, with2FACount] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.count({ where: { ...where, isActive: true } }),
            this.prisma.user.count({ where: { ...where, isTwoFactorEnabled: true } }),
        ]);
        return {
            total,
            active: activeCount,
            inactive: total - activeCount,
            with2FA: with2FACount,
        };
    }
    async findOne(id, organizationId) {
        const user = await this.prisma.user.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: { role: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return this.sanitizeUserResponse(user);
    }
    async update(id, dto, organizationId) {
        await this.findOne(id, organizationId);
        const data = { ...dto };
        if (dto.password) {
            data.passwordHash = await this.hashPassword(dto.password);
            delete data.password;
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data,
            include: { role: true },
        });
        return this.sanitizeUserResponse(updated);
    }
    async remove(id, organizationId) {
        await this.findOne(id, organizationId);
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    findRoles(organizationId, callerRole) {
        const isSuperAdmin = callerRole === auth_constants_1.ROLE_SUPER_ADMIN;
        return this.prisma.role.findMany({
            where: {
                ...(organizationId
                    ? { OR: [{ organizationId }, { organizationId: null }] }
                    : {}),
                ...(isSuperAdmin ? {} : { NOT: { name: auth_constants_1.ROLE_SUPER_ADMIN } }),
            },
            orderBy: [{ organizationId: 'asc' }, { name: 'asc' }],
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map