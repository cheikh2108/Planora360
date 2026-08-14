import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCapitalizationDto } from './dto/create-capitalization.dto';
import { UpdateCapitalizationDto } from './dto/update-capitalization.dto';
import { FilterCapitalizationDto } from './dto/filter-capitalization.dto';

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

    return record;
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

  async deleteMedia(
    mediaId: string,
    capitalizationId: string,
    organizationId: string,
  ) {
    await this.findOne(capitalizationId, organizationId);

    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
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
