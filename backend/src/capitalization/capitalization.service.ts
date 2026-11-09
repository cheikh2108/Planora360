import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { validateFile, MEDIA_EXTENSIONS } from '../documents/file-validator';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCapitalizationDto } from './dto/create-capitalization.dto';
import { UpdateCapitalizationDto } from './dto/update-capitalization.dto';
import { FilterCapitalizationDto } from './dto/filter-capitalization.dto';

const MEDIA_TYPES = ['PHOTO', 'VIDEO', 'DOCUMENT'];

@Injectable()
export class CapitalizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(
    dto: CreateCapitalizationDto,
    organizationId: string,
    userId: string,
  ) {
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

  async findAll(organizationId: string, filters?: FilterCapitalizationDto) {
    const where: any = { organizationId };

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

    const records = await this.prisma.capitalizationRecord.findMany({
      where,
      include: {
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return records.map((r) => this.withMediaUrls(r));
  }

  /** Remplace la clé de stockage de chaque média par son URL servie par l'API (GET /api/files/...). */
  private withMediaUrls<T extends { media?: { url: string }[] }>(record: T): T {
    if (!record.media) return record;
    return {
      ...record,
      media: record.media.map((m) => ({ ...m, url: this.storage.fileUrl(this.storage.keyFromStored(m.url)) })),
    };
  }

  async findOne(id: string, organizationId: string) {
    const record = await this.prisma.capitalizationRecord.findFirst({
      where: { id, organizationId },
      include: {
        media: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Fiche de capitalisation non trouvée');
    }

    return this.withMediaUrls(record);
  }

  async update(
    id: string,
    dto: UpdateCapitalizationDto,
    organizationId: string,
    userId: string,
  ) {
    const record = await this.findOne(id, organizationId);

    if (record.authorId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres fiches');
    }

    return this.prisma.capitalizationRecord.update({
      where: { id },
      data: dto,
      include: {
        media: true,
      },
    });
  }

  async remove(id: string, organizationId: string, userId: string) {
    const record = await this.findOne(id, organizationId);

    if (record.authorId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres fiches');
    }

    const media = await this.prisma.media.findMany({
      where: { capitalizationId: id },
    });

    for (const file of media) {
      try {
        await this.storage.delete(file.url);
      } catch (error) {
        console.error(`Erreur suppression média ${file.id}:`, error);
      }
    }

    return this.prisma.capitalizationRecord.delete({
      where: { id },
    });
  }

  async uploadMedia(
    capitalizationId: string,
    file: Express.Multer.File,
    type: string,
    organizationId: string,
  ) {
    await this.findOne(capitalizationId, organizationId);

    if (!file) throw new BadRequestException('Fichier manquant');
    const ext = await validateFile(file, { allowed: MEDIA_EXTENSIONS, maxSize: 10 * 1024 * 1024 });

    // On stocke la clé (stable), jamais une URL signée qui expirerait
    const storageKey = this.storage.buildKey(organizationId, ['capitalization', capitalizationId], ext);
    await this.storage.upload(storageKey, file);

    // Type déduit du fichier vérifié si le client ne l'envoie pas (ou envoie une valeur inconnue)
    const mediaType = MEDIA_TYPES.includes(type)
      ? type
      : ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) ? 'PHOTO' : 'DOCUMENT';

    const media = await this.prisma.media.create({
      data: {
        capitalizationId,
        type: mediaType,
        filename: file.originalname,
        url: storageKey,
        size: file.size,
      },
    });
    return { ...media, url: this.storage.fileUrl(storageKey) };
  }

  async deleteMedia(
    mediaId: string,
    capitalizationId: string,
    organizationId: string,
  ) {
    await this.findOne(capitalizationId, organizationId);

    // Le média doit appartenir à CETTE fiche (sinon on pourrait supprimer le média d'une autre organisation)
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, capitalizationId },
    });

    if (!media) {
      throw new NotFoundException('Média non trouvé');
    }

    await this.storage.delete(media.url);

    return this.prisma.media.delete({
      where: { id: mediaId },
    });
  }
}
