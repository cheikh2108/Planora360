import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PostHogService } from '../analytics/posthog.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private posthog: PostHogService,
  ) {}

  async uploadToActivity(
    activityId: string,
    file: Express.Multer.File,
    type: string,
    organizationId: string,
    uploadedById: string,
  ) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');

    const storageKey = `${organizationId}/${activityId}/${Date.now()}-${file.originalname}`;
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

    // Track document upload
    this.posthog.trackDocumentUploaded(uploadedById, document.id, file.size, organizationId);

    return document;
  }

  async uploadToChecklistItem(
    checklistItemId: string,
    file: Express.Multer.File,
    type: string,
    organizationId: string,
    uploadedById: string,
  ) {
    const item = await this.prisma.checklistItem.findFirst({
      where: { id: checklistItemId, activity: { organizationId } },
    });
    if (!item) throw new NotFoundException('Tâche introuvable');

    const storageKey = `${organizationId}/checklist/${checklistItemId}/${Date.now()}-${file.originalname}`;
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

  async findByActivity(activityId: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');
    return this.prisma.document.findMany({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByChecklistItem(checklistItemId: string, organizationId: string) {
    const item = await this.prisma.checklistItem.findFirst({
      where: { id: checklistItemId, activity: { organizationId } },
    });
    if (!item) throw new NotFoundException('Tâche introuvable');
    return this.prisma.document.findMany({
      where: { checklistItemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDownloadUrl(id: string, organizationId: string) {
    const doc = await this.prisma.document.findFirst({
      where: {
        id,
        OR: [
          { activity: { organizationId } },
          { checklistItem: { activity: { organizationId } } },
        ],
      },
    });
    if (!doc) throw new NotFoundException('Document introuvable');
    const url = await this.storage.getSignedUrl(doc.storageKey);
    return { url, fileName: doc.fileName, mimeType: doc.mimeType };
  }

  async remove(id: string, organizationId: string) {
    const doc = await this.prisma.document.findFirst({
      where: {
        id,
        OR: [
          { activity: { organizationId } },
          { checklistItem: { activity: { organizationId } } },
        ],
      },
    });
    if (!doc) throw new NotFoundException('Document introuvable');
    await this.storage.delete(doc.storageKey);
    return this.prisma.document.delete({ where: { id } });
  }
}
