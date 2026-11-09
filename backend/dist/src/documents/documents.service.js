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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const prisma_service_1 = require("../common/prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const posthog_service_1 = require("../analytics/posthog.service");
let DocumentsService = class DocumentsService {
    prisma;
    storage;
    posthog;
    constructor(prisma, storage, posthog) {
        this.prisma = prisma;
        this.storage = storage;
        this.posthog = posthog;
    }
    async uploadToActivity(activityId, file, type, organizationId, uploadedById) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        const storageKey = this.storage.buildKey(organizationId, [activityId], (0, path_1.extname)(file.originalname).slice(1));
        await this.storage.upload(storageKey, file);
        const document = await this.prisma.document.create({
            data: {
                activityId,
                type: type ?? 'autre',
                storageKey,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                uploadedById,
            },
        });
        this.posthog.trackDocumentUploaded(uploadedById, document.id, file.size, organizationId);
        return document;
    }
    async uploadToChecklistItem(checklistItemId, file, type, organizationId, uploadedById) {
        const item = await this.prisma.checklistItem.findFirst({
            where: { id: checklistItemId, activity: { organizationId } },
        });
        if (!item)
            throw new common_1.NotFoundException('Tâche introuvable');
        const storageKey = this.storage.buildKey(organizationId, ['checklist', checklistItemId], (0, path_1.extname)(file.originalname).slice(1));
        await this.storage.upload(storageKey, file);
        return this.prisma.document.create({
            data: {
                checklistItemId,
                activityId: item.activityId,
                type: type ?? 'autre',
                storageKey,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                uploadedById,
            },
        });
    }
    async findByActivity(activityId, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        return this.prisma.document.findMany({
            where: { activityId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByChecklistItem(checklistItemId, organizationId) {
        const item = await this.prisma.checklistItem.findFirst({
            where: { id: checklistItemId, activity: { organizationId } },
        });
        if (!item)
            throw new common_1.NotFoundException('Tâche introuvable');
        return this.prisma.document.findMany({
            where: { checklistItemId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getDownloadUrl(id, organizationId) {
        const doc = await this.prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { activity: { organizationId } },
                    { checklistItem: { activity: { organizationId } } },
                ],
            },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document introuvable');
        const url = await this.storage.getSignedUrl(doc.storageKey);
        return { url, fileName: doc.fileName, mimeType: doc.mimeType };
    }
    async remove(id, organizationId) {
        const doc = await this.prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { activity: { organizationId } },
                    { checklistItem: { activity: { organizationId } } },
                ],
            },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document introuvable');
        await this.storage.delete(doc.storageKey);
        return this.prisma.document.delete({ where: { id } });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        posthog_service_1.PostHogService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map