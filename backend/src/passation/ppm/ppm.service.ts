import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
import { CreateLignePpmDto } from './dto/create-ligne-ppm.dto';
import { StatusPPM } from '@prisma/client';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { createWithReference, nextReferenceFrom } from '../../common/utils/reference';

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

    // Le projet (plan d'action) rattaché doit appartenir à l'organisation
    if (dto.projectId) {
      const project = await this.prisma.actionPlan.findFirst({ where: { id: dto.projectId, organizationId } });
      if (!project) throw new BadRequestException('Plan d\'action introuvable dans votre organisation');
    }

    // Référence PPM-<année>-<n°>, propre à l'organisation. Un PPM démarre toujours en brouillon :
    // la validation passe par POST /ppm/:id/validate.
    const prefix = `PPM-${dto.year}-`;
    return createWithReference(
      async () =>
        nextReferenceFrom(
          (await this.prisma.planPassationMarche.findMany({
            where: { organizationId, reference: { startsWith: prefix } },
            select: { reference: true },
          })).map((p) => p.reference),
          prefix,
          3,
        ),
      (reference) =>
        this.prisma.planPassationMarche.create({
          data: {
            year: dto.year,
            title: dto.title,
            projectId: dto.projectId ?? null,
            reference,
            organizationId,
            createdBy: userId,
          },
          include: {
            lignes: true,
            project: { select: { id: true, title: true } },
          },
        }),
    );
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

  async updateStatus(id: string, organizationId: string, newStatus: StatusPPM) {
    const ppm = await this.findOne(id, organizationId);

    return this.prisma.planPassationMarche.update({
      where: { id },
      data: {
        status: newStatus,
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

  async addLigne(
    ppmId: string,
    organizationId: string,
    userId: string,
    ligneDto: CreateLignePpmDto,
  ) {
    const ppm = await this.findOne(ppmId, organizationId);

    // Seuls les PPM en brouillon peuvent recevoir de nouvelles lignes
    if (ppm.status !== StatusPPM.BROUILLON) {
      throw new ForbiddenException(
        'Seuls les PPM en brouillon peuvent être modifiés',
      );
    }

    // Générer référence unique pour la ligne
    const count = await this.prisma.lignePPM.count({
      where: { ppmId },
    });
    const reference = `${ppm.reference}-L${String(count + 1).padStart(3, '0')}`;

    // Créer la ligne
    const ligne = await this.prisma.lignePPM.create({
      data: {
        reference,
        ppmId,
        responsableId: userId,
        objet: ligneDto.objet,
        montantEstimatif: ligneDto.montantEstimatif,
        methodeProcedure: ligneDto.methodeProcedure,
        trimestre: ligneDto.trimestre,
        sourceFinancement: ligneDto.sourceFinancement,
        ligneBudgetaire: ligneDto.ligneBudgetaire,
        observations: ligneDto.observations,
        activityId: ligneDto.activityId,
      },
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
    });

    // Recalculer le montant total du PPM
    const totalResult = await this.prisma.lignePPM.aggregate({
      where: { ppmId },
      _sum: {
        montantEstimatif: true,
      },
    });

    await this.prisma.planPassationMarche.update({
      where: { id: ppmId },
      data: {
        montantTotal: totalResult._sum.montantEstimatif || 0,
        nombreLignes: count + 1,
      },
    });

    return ligne;
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
