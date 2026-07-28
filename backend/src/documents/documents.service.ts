import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.document.create({
      data: {
        activityId,
        type,
        storageKey,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedById,
      },
    });
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

    return this.prisma.document.create({
      data: {
        checklistItemId,
        activityId: item.activityId,
        type,
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

    // Supprimer le fichier local (en Phase 6 : supprimer sur Backblaze B2)
    const localPath = path.join(process.cwd(), 'uploads', doc.storageKey);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    return this.prisma.document.delete({ where: { id } });
  }
}
