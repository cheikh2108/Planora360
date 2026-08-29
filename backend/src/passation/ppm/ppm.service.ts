import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
import { StatusPPM } from '@prisma/client';

@Injectable()
export class PpmService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: CreatePpmDto) {
    // Vérifier qu'il n'existe pas déjà un PPM pour cette année
    const existing = await this.prisma.planPassationMarche.findFirst({
      where: {
        organizationId,
        year: dto.year,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Un PPM existe déjà pour l'année ${dto.year}`,
      );
    }

    return this.prisma.planPassationMarche.create({
      data: {
        ...dto,
        organizationId,
        createdBy: userId,
      },
      include: {
        lignes: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findAll(organizationId: string, filters?: {
    year?: number;
    status?: StatusPPM;
    projectId?: string;
  }) {
    return this.prisma.planPassationMarche.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(filters?.year && { year: filters.year }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.projectId && { projectId: filters.projectId }),
      },
      include: {
        lignes: {
          where: { deletedAt: null },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, organizationId: string) {
    const ppm = await this.prisma.planPassationMarche.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        lignes: {
          where: { deletedAt: null },
          include: {
            responsable: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            activity: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!ppm) {
      throw new NotFoundException(`PPM #${id} introuvable`);
    }

    return ppm;
  }

  async update(id: string, organizationId: string, dto: UpdatePpmDto) {
    const ppm = await this.findOne(id, organizationId);

    // Ne pas permettre la modification si déjà validé
    if (ppm.status === StatusPPM.VALIDE) {
      throw new ForbiddenException(
        'Impossible de modifier un PPM déjà validé',
      );
    }

    return this.prisma.planPassationMarche.update({
      where: { id },
      data: dto,
      include: {
        lignes: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const ppm = await this.findOne(id, organizationId);

    // Soft delete
    return this.prisma.planPassationMarche.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async validate(id: string, organizationId: string, userId: string) {
    const ppm = await this.findOne(id, organizationId);

    if (ppm.status === StatusPPM.VALIDE) {
      throw new BadRequestException('Ce PPM est déjà validé');
    }

    // Vérifier qu'il y a au moins une ligne
    if (!ppm.lignes || ppm.lignes.length === 0) {
      throw new BadRequestException(
        'Impossible de valider un PPM sans lignes',
      );
    }

    return this.prisma.planPassationMarche.update({
      where: { id },
      data: {
        status: StatusPPM.VALIDE,
        validatedBy: userId,
        validatedAt: new Date(),
      },
      include: {
        lignes: true,
      },
    });
  }

  /**
   * Exporter le PPM en PDF ou Excel
   */
  async export(id: string, organizationId: string, format: 'pdf' | 'excel') {
    const ppm = await this.findOne(id, organizationId);

    // TODO: Implémenter la génération de fichier avec pdfkit ou exceljs
    // Pour l'instant, retourner les données brutes
    return {
      format,
      data: ppm,
      // TODO: générer le fichier et retourner l'URL
    };
  }
}
