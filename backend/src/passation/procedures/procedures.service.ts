import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatusProcedure, MethodeProcedure } from '@prisma/client';

/**
 * Service de gestion des procédures de passation
 *
 * Gère les consultations et appels d'offres :
 * - Création et publication des procédures
 * - Gestion du dossier de consultation (DAO/TDR)
 * - Réception des soumissions
 * - Clôture et attribution
 */
@Injectable()
export class ProceduresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: any) {
    // Générer référence unique
    const count = await this.prisma.procedure.count({
      where: { organizationId },
    });
    const reference = `PROC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.procedure.create({
      data: {
        ...dto,
        reference,
        organizationId,
        responsableId: userId,
      },
      include: {
        responsable: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lignePPM: true,
      },
    });
  }

  async findAll(organizationId: string, filters?: any) {
    return this.prisma.procedure.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.methode && { methodeProcedure: filters.methode }),
        ...(filters?.responsableId && { responsableId: filters.responsableId }),
      },
      include: {
        responsable: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lignePPM: {
          select: {
            id: true,
            reference: true,
            objet: true,
          },
        },
        _count: {
          select: {
            soumissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const procedure = await this.prisma.procedure.findFirst({
      where: {
        id,
        organizationId,
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
        lignePPM: true,
        soumissions: {
          include: {
            fournisseur: {
              select: {
                id: true,
                raisonSociale: true,
                identifiantFiscal: true,
              },
            },
          },
          orderBy: { dateDepot: 'desc' },
        },
        commission: {
          include: {
            membres: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!procedure) {
      throw new NotFoundException(`Procédure #${id} introuvable`);
    }

    return procedure;
  }

  async update(id: string, organizationId: string, dto: any) {
    const procedure = await this.findOne(id, organizationId);

    // Ne pas permettre la modification si déjà publiée
    if (procedure.status !== StatusProcedure.BROUILLON) {
      throw new ForbiddenException(
        'Seules les procédures en brouillon peuvent être modifiées'
      );
    }

    return this.prisma.procedure.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, organizationId: string) {
    const procedure = await this.findOne(id, organizationId);

    // Seules les procédures en brouillon peuvent être supprimées
    if (procedure.status !== StatusProcedure.BROUILLON) {
      throw new ForbiddenException(
        'Seules les procédures en brouillon peuvent être supprimées'
      );
    }

    return this.prisma.procedure.delete({
      where: { id },
    });
  }

  async publish(id: string, organizationId: string) {
    const procedure = await this.findOne(id, organizationId);

    if (procedure.status !== StatusProcedure.BROUILLON) {
      throw new BadRequestException('Cette procédure est déjà publiée');
    }

    // Vérifier que les dates obligatoires sont renseignées
    if (!procedure.dateLimite || !procedure.dateOuverture) {
      throw new BadRequestException(
        'Les dates limite et d\'ouverture sont obligatoires pour publier'
      );
    }

    return this.prisma.procedure.update({
      where: { id },
      data: {
        status: StatusProcedure.PUBLIEE,
        datePublication: new Date(),
      },
    });
  }

  async close(id: string, organizationId: string) {
    const procedure = await this.findOne(id, organizationId);

    if (procedure.status !== StatusProcedure.PUBLIEE && procedure.status !== StatusProcedure.EN_COURS) {
      throw new BadRequestException('Seules les procédures publiées ou en cours peuvent être clôturées');
    }

    return this.prisma.procedure.update({
      where: { id },
      data: {
        status: StatusProcedure.CLOTUREE_OFFRES,
      },
    });
  }

  async cancel(id: string, organizationId: string, motif: string) {
    const procedure = await this.findOne(id, organizationId);

    return this.prisma.procedure.update({
      where: { id },
      data: {
        status: StatusProcedure.ANNULEE,
      },
    });
  }
}
