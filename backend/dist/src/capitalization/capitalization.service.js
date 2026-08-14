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
exports.CapitalizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let CapitalizationService = class CapitalizationService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async create(dto, organizationId, userId) {
        return this.prisma.capitalizationRecord.create({
            data: {
                ...dto,
                organizationId,
                authorId: userId,
                tags: dto.tags || [],
                status: dto.status || 'BROUILLON',
            },
            include: {
                media: true,
            },
        });
    }
    async findAll(organizationId, filters) {
        const where = { organizationId };
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.tags && filters.tags.length > 0) {
            where.tags = { hasSome: filters.tags };
        }
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { context: { contains: filters.search, mode: 'insensitive' } },
                { solutions: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.capitalizationRecord.findMany({
            where,
            include: {
                media: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, organizationId) {
        const record = await this.prisma.capitalizationRecord.findFirst({
            where: { id, organizationId },
            include: {
                media: true,
            },
        });
        if (!record) {
            throw new common_1.NotFoundException('Fiche de capitalisation non trouvée');
        }
        return record;
    }
    async update(id, dto, organizationId, userId) {
        const record = await this.findOne(id, organizationId);
        if (record.authorId !== userId) {
            throw new common_1.ForbiddenException('Vous ne pouvez modifier que vos propres fiches');
        }
        return this.prisma.capitalizationRecord.update({
            where: { id },
            data: dto,
            include: {
                media: true,
            },
        });
    }
    async remove(id, organizationId, userId) {
        const record = await this.findOne(id, organizationId);
        if (record.authorId !== userId) {
            throw new common_1.ForbiddenException('Vous ne pouvez supprimer que vos propres fiches');
        }
        const media = await this.prisma.media.findMany({
            where: { capitalizationId: id },
        });
        for (const file of media) {
            try {
                await this.storage.delete(file.url);
            }
            catch (error) {
                console.error(`Erreur suppression média ${file.id}:`, error);
            }
        }
        return this.prisma.capitalizationRecord.delete({
            where: { id },
        });
    }
    async uploadMedia(capitalizationId, file, type, organizationId) {
        await this.findOne(capitalizationId, organizationId);
        const storageKey = `capitalization/${organizationId}/${capitalizationId}/${Date.now()}-${file.originalname}`;
        const uploadedKey = await this.storage.upload(storageKey, file);
        const url = await this.storage.getSignedUrl(uploadedKey);
        return this.prisma.media.create({
            data: {
                capitalizationId,
                type,
                filename: file.originalname,
                url: uploadedKey,
                size: file.size,
            },
        });
    }
    async deleteMedia(mediaId, capitalizationId, organizationId) {
        await this.findOne(capitalizationId, organizationId);
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
        });
        if (!media) {
            throw new common_1.NotFoundException('Média non trouvé');
        }
        await this.storage.delete(media.url);
        return this.prisma.media.delete({
            where: { id: mediaId },
        });
    }
};
exports.CapitalizationService = CapitalizationService;
exports.CapitalizationService = CapitalizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], CapitalizationService);
//# sourceMappingURL=capitalization.service.js.map