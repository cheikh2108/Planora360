import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(procedureId: string, userId: string, organizationId: string, dto: CreateEvaluationDto) {
    // La procédure doit appartenir à l'organisation
    const procedure = await this.prisma.procedure.findFirst({
      where: { id: procedureId, organizationId },
      select: { id: true },
    });
    if (!procedure) throw new NotFoundException('Procédure introuvable');

    // L'évaluateur doit être membre d'une commission de cette procédure
    const commission = await this.prisma.commission.findFirst({
      where: { procedureId, membres: { some: { userId } } },
    });
    if (!commission) {
      throw new ForbiddenException('Vous ne faites pas partie de la commission d\'évaluation');
    }

    // L'offre évaluée doit avoir été déposée sur CETTE procédure
    const soumission = await this.prisma.soumission.findFirst({
      where: { id: dto.soumissionId, procedureId },
      select: { id: true },
    });
    if (!soumission) throw new NotFoundException('Offre introuvable pour cette procédure');

    const scores = [dto.scoreAdmin, dto.scoreTechnique, dto.scoreFinancier].filter((v): v is number => typeof v === 'number');
    const scoreGlobal = dto.scoreGlobal ?? (scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null);

    return this.prisma.evaluation.create({
      data: {
        soumissionId: soumission.id,
        commissionId: commission.id,
        evaluateurId: userId,
        scoreAdmin: dto.scoreAdmin,
        scoreTechnique: dto.scoreTechnique,
        scoreFinancier: dto.scoreFinancier,
        scoreGlobal,
        criteres: dto.criteres as any,
        commentaires: dto.commentaires,
      },
      include: {
        soumission: { include: { fournisseur: { select: { id: true, raisonSociale: true } } } },
        evaluateur: { select: { id: true, firstName: true, lastName: true } },
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
