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
import { ERROR_MESSAGES } from '../common/constants/error-messages';

/**
 * Service de gestion des Plans de Passation des Marchés (PPM)
 *
 * Gère le cycle de vie complet des PPM :
 * - Création et modification des plans annuels
 * - Gestion des lignes PPM (marchés prévus)
 * - Validation des plans
 * - Export des plans (PDF/Excel)
 *
 * @remarks
 * Un PPM est un document annuel qui planifie tous les marchés
 * qu'une organisation prévoit de lancer dans l'année.
 * Chaque organisation ne peut avoir qu'un seul PPM par année.
 */
@Injectable()
export class PpmService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: CreatePpmDto) {
    // Vérifier qu'il n'existe pas déjà un PPM pour cette année
    const existing = await this.prisma.planPassationMarche.findFirst({
      where: {
        organizationId,
        year: dto.year,
      },
    });

    if (existing) {
      throw new BadRequestException(ERROR_MESSAGES.PPM.DUPLICATE_YEAR(dto.year));
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
        ...(filters?.year && { year: filters.year }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.projectId && { projectId: filters.projectId }),
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
      },
      include: {
        lignes: {
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
      throw new NotFoundException(ERROR_MESSAGES.PPM.NOT_FOUND(id));
    }

    return ppm;
  }

  async update(id: string, organizationId: string, dto: UpdatePpmDto) {
    const ppm = await this.findOne(id, organizationId);

    // Ne pas permettre la modification si déjà validé
    if (ppm.status === StatusPPM.VALIDE) {
      throw new ForbiddenException(ERROR_MESSAGES.PPM.CANNOT_MODIFY_VALIDATED);
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

    // Seuls les PPM en brouillon peuvent être supprimés
    if (ppm.status !== StatusPPM.BROUILLON) {
      throw new ForbiddenException(ERROR_MESSAGES.PPM.ONLY_DRAFT_CAN_BE_DELETED);
    }

    // Suppression définitive (ou on pourrait utiliser un statut ARCHIVE)
    return this.prisma.planPassationMarche.delete({
      where: { id },
    });
  }

  async validate(id: string, organizationId: string, userId: string) {
    const ppm = await this.findOne(id, organizationId);

    if (ppm.status === StatusPPM.VALIDE) {
      throw new BadRequestException(ERROR_MESSAGES.PPM.ALREADY_VALIDATED);
    }

    // Vérifier qu'il y a au moins une ligne
    if (!ppm.lignes || ppm.lignes.length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.PPM.NO_LINES);
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
