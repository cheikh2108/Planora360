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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
let OrganizationsService = class OrganizationsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async create(dto) {
        const existing = await this.prisma.organization.findFirst({ where: { name: dto.name } });
        if (existing)
            throw new common_1.ConflictException('Une organisation avec ce nom existe déjà');
        const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
        if (emailTaken)
            throw new common_1.ConflictException('Cet email est déjà utilisé');
        const isTrialPlan = !dto.subscriptionPlan || dto.subscriptionPlan === 'DECOUVERTE';
        const trialEndsAt = isTrialPlan
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : undefined;
        const org = await this.prisma.organization.create({
            data: {
                name: dto.name,
                logoUrl: dto.logoUrl,
                subscriptionPlan: dto.subscriptionPlan ?? 'DECOUVERTE',
                status: 'ACTIVE',
                trialEndsAt,
            },
        });
        const adminRole = await this.prisma.role.findFirst({
            where: { name: 'Administrateur', organizationId: null },
        });
        if (!adminRole)
            throw new common_1.NotFoundException('Rôle Administrateur introuvable');
        const tempPassword = (0, crypto_1.randomBytes)(6).toString('base64url').slice(0, 10);
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        await this.prisma.user.create({
            data: {
                email: dto.adminEmail,
                firstName: dto.adminFirstName,
                lastName: dto.adminLastName,
                passwordHash,
                organizationId: org.id,
                roleId: adminRole.id,
                mustChangePassword: true,
            },
        });
        await this.notifications.sendWelcomeCredentials({
            email: dto.adminEmail,
            firstName: dto.adminFirstName,
            orgName: org.name,
            tempPassword,
        });
        return org;
    }
    findPending() {
        return this.prisma.organization.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { users: true } },
                users: { take: 1, orderBy: { createdAt: 'asc' }, select: { email: true, firstName: true, lastName: true } },
            },
        });
    }
    findAll() {
        return this.prisma.organization.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { users: true, actionPlans: true } } },
        });
    }
    async approve(id) {
        const org = await this.findOne(id);
        if (org.status !== 'PENDING')
            throw new common_1.BadRequestException('Organisation non en attente');
        await this.prisma.organization.update({
            where: { id },
            data: { status: 'ACTIVE' },
        });
        await this.prisma.user.updateMany({
            where: { organizationId: id },
            data: { isActive: true },
        });
        return { message: 'Organisation approuvée' };
    }
    async reject(id, reason) {
        const org = await this.findOne(id);
        if (org.status !== 'PENDING')
            throw new common_1.BadRequestException('Organisation non en attente');
        await this.prisma.organization.update({
            where: { id },
            data: { status: 'REJECTED', rejectionReason: reason ?? null },
        });
        return { message: 'Organisation rejetée' };
    }
    async findOne(id) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
            include: { _count: { select: { actionPlans: true, users: true } } },
        });
        if (!org)
            throw new common_1.NotFoundException('Organisation introuvable');
        return org;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.organization.update({ where: { id }, data: dto });
    }
    async updateBrandColor(organizationId, brandColor) {
        if (!/^#[0-9a-fA-F]{6}$/.test(brandColor)) {
            throw new common_1.BadRequestException('Couleur invalide — format attendu : #rrggbb');
        }
        return this.prisma.organization.update({
            where: { id: organizationId },
            data: { brandColor },
            select: { id: true, brandColor: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.organization.delete({ where: { id } });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map