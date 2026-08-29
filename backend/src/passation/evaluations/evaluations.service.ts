import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(procedureId: string, userId: string, dto: any) {
    // Vérifier que l'utilisateur fait partie de la commission
    const commission = await this.prisma.commission.findFirst({
      where: {
        procedureId,
        membres: {
          some: {
            userId,
          },
        },
      },
    });

    if (!commission) {
      throw new ForbiddenException('Vous ne faites pas partie de la commission d\'évaluation');
    }

    return this.prisma.evaluation.create({
      data: {
        ...dto,
        evaluateurId: userId,
        commissionId: commission.id,
      },
      include: {
        soumission: {
          include: {
            fournisseur: {
              select: {
                id: true,
                raisonSociale: true,
              },
            },
          },
        },
        evaluateur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(procedureId: string, organizationId: string) {
    return this.prisma.evaluation.findMany({
      where: {
        commission: {
          procedureId,
        },
      },
      include: {
        soumission: {
          include: {
            fournisseur: {
              select: {
                id: true,
                raisonSociale: true,
              },
            },
          },
        },
        evaluateur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSynthese(procedureId: string, organizationId: string) {
    const evaluations = await this.findAll(procedureId, organizationId);

    // Grouper par soumission et calculer les moyennes
    const grouped = evaluations.reduce((acc: any, evaluation) => {
      const soumissionId = evaluation.soumissionId;
      if (!acc[soumissionId]) {
        acc[soumissionId] = {
          soumission: evaluation.soumission,
          evaluations: [],
          noteTotale: 0,
          count: 0,
        };
      }
      acc[soumissionId].evaluations.push(evaluation);
      // Utiliser scoreGlobal avec vérification null
      if (evaluation.scoreGlobal !== null) {
        acc[soumissionId].noteTotale += evaluation.scoreGlobal;
      }
      acc[soumissionId].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).map((item: any) => ({
      soumission: item.soumission,
      evaluations: item.evaluations,
      moyenne: item.count > 0 ? item.noteTotale / item.count : 0,
      nombreEvaluations: item.count,
    })).sort((a: any, b: any) => b.moyenne - a.moyenne);
  }
}
