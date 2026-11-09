import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatusContrat } from '@prisma/client';
import { createWithReference, nextReferenceFrom } from '../../common/utils/reference';
import { CreateContratDto } from './dto/create-contrat.dto';
import { UpdateContratDto } from './dto/update-contrat.dto';

@Injectable()
export class ContratsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: CreateContratDto) {
    // Vérifier que la procédure existe et appartient à l'organisation
    const procedure = await this.prisma.procedure.findFirst({
      where: {
        id: dto.procedureId,
        organizationId,
      },
    });

    if (!procedure) {
      throw new NotFoundException(
        `Procédure #${dto.procedureId} introuvable dans votre organisation`,
      );
    }

    // Vérifier que la procédure est dans un statut permettant de créer un contrat
    if (procedure.status !== 'CLOTUREE_OFFRES' && procedure.status !== 'ATTRIBUEE') {
      throw new ForbiddenException(
        `La procédure doit être clôturée ou attribuée pour créer un contrat (statut actuel: ${procedure.status})`,
      );
    }

    // Vérifier qu'il n'existe pas déjà un contrat pour cette procédure
    const existingContrat = await this.prisma.contrat.findFirst({
      where: { procedureId: dto.procedureId },
    });

    if (existingContrat) {
      throw new ForbiddenException(
        `Un contrat existe déjà pour cette procédure : ${existingContrat.reference}`,
      );
    }

    // Vérifier que le fournisseur existe et appartient à l'organisation
    const fournisseur = await this.prisma.fournisseur.findFirst({
      where: {
        id: dto.fournisseurId,
        organizationId,
      },
    });

    if (!fournisseur) {
      throw new NotFoundException(
        `Fournisseur #${dto.fournisseurId} introuvable dans votre organisation`,
      );
    }

    // L'offre retenue doit appartenir à cette procédure et à ce fournisseur
    if (dto.soumissionId) {
      const soumission = await this.prisma.soumission.findFirst({
        where: { id: dto.soumissionId, procedureId: dto.procedureId, fournisseurId: dto.fournisseurId },
      });
      if (!soumission) {
        throw new BadRequestException('Offre introuvable pour cette procédure et ce fournisseur');
      }
    }
    this.assertDates(dto.dateSignature, dto.dateEcheance);

    // Le montant payé et le statut ne se fixent pas à la création : ils suivent les paiements
    // et POST /contrats/:id/status.
    const base = {
      ...this.toContratData(dto),
      procedureId: dto.procedureId,
      fournisseurId: dto.fournisseurId,
      soumissionId: dto.soumissionId ?? null,
      montantInitial: dto.montantInitial,
      dateSignature: new Date(dto.dateSignature),
      dateEcheance: new Date(dto.dateEcheance),
      organizationId,
      gestionnaire: userId,
    };
    const prefix = `CONT-${new Date().getFullYear()}-`;

    return createWithReference(
      async () =>
        nextReferenceFrom(
          (await this.prisma.contrat.findMany({
            where: { organizationId, reference: { startsWith: prefix } },
            select: { reference: true },
          })).map((c) => c.reference),
          prefix,
          4,
        ),
      (reference) => this.prisma.contrat.create({
      data: { ...base, reference },
      include: {
        fournisseur: {
          select: {
            id: true,
            raisonSociale: true,
            identifiantFiscal: true,
          },
        },
        procedure: {
          select: {
            id: true,
            reference: true,
            objet: true,
          },
        },
        gestionnaireUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    );
  }

  private assertDates(debut?: string, fin?: string) {
    if (debut && fin && new Date(fin) <= new Date(debut)) {
      throw new BadRequestException('La date d\'échéance doit être postérieure à la date de signature');
    }
  }

  /** Champs facultatifs modifiables d'un contrat. */
  private toContratData(dto: UpdateContratDto) {
    const date = (v?: string) => (v ? new Date(v) : null);
    return {
      ...(dto.montantRevise !== undefined && { montantRevise: dto.montantRevise }),
      ...(dto.devise !== undefined && { devise: dto.devise }),
      ...(dto.dateDemarrage !== undefined && { dateDemarrage: date(dto.dateDemarrage) }),
      ...(dto.dateReceptionProv !== undefined && { dateReceptionProv: date(dto.dateReceptionProv) }),
      ...(dto.dateReceptionDef !== undefined && { dateReceptionDef: date(dto.dateReceptionDef) }),
      ...(dto.modalitesAvance !== undefined && { modalitesAvance: dto.modalitesAvance }),
      ...(dto.modalitesAcompte !== undefined && { modalitesAcompte: dto.modalitesAcompte }),
      ...(dto.modalitesRetenue !== undefined && { modalitesRetenue: dto.modalitesRetenue }),
      ...(dto.garanties !== undefined && { garanties: dto.garanties }),
    };
  }

  async findAll(organizationId: string, filters?: any) {
    return this.prisma.contrat.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.fournisseurId && { fournisseurId: filters.fournisseurId }),
      },
      include: {
        fournisseur: {
          select: {
            id: true,
            raisonSociale: true,
            identifiantFiscal: true,
          },
        },
        gestionnaireUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            livrables: true,
            paiements: true,
            avenants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const contrat = await this.prisma.contrat.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        fournisseur: true,
        procedure: true,
        gestionnaireUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        livrables: {
          include: {
            responsable: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            receptions: true,
          },
          orderBy: { dateEcheance: 'asc' },
        },
        paiements: {
          orderBy: { dateEcheance: 'asc' },
        },
        avenants: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contrat) {
      throw new NotFoundException('Contrat introuvable');
    }

    return contrat;
  }

  async update(id: string, organizationId: string, dto: UpdateContratDto) {
    const contrat = await this.findOne(id, organizationId);
    if (dto.dateEcheance) this.assertDates(contrat.dateSignature.toISOString(), dto.dateEcheance);

    const data = {
      ...this.toContratData(dto),
      ...(dto.dateEcheance !== undefined && { dateEcheance: new Date(dto.dateEcheance) }),
    };

    return this.prisma.contrat.update({
      where: { id },
      data,
    });
  }

  async changeStatus(
    id: string,
    organizationId: string,
    newStatus: StatusContrat,
    motif?: string
  ) {
    await this.findOne(id, organizationId);

    return this.prisma.contrat.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });
  }

  async getDashboard(id: string, organizationId: string) {
    const contrat = await this.findOne(id, organizationId);

    const totalPaiements = contrat.paiements.reduce(
      (sum, p) => sum + Number(p.montantNet),
      0
    );
    const paiementsEffectues = contrat.paiements.filter(p => p.datePaiement).length;
    const livrablesReceptionnes = contrat.livrables.filter(
      l => l.receptions && l.receptions.length > 0
    ).length;

    return {
      contrat: {
        id: contrat.id,
        reference: contrat.reference,
        montantInitial: contrat.montantInitial,
        montantRevise: contrat.montantRevise,
        status: contrat.status,
        dateSignature: contrat.dateSignature,
        dateDemarrage: contrat.dateDemarrage,
        dateEcheance: contrat.dateEcheance,
      },
      fournisseur: contrat.fournisseur,
      statistiques: {
        montantTotal: Number(contrat.montantRevise || contrat.montantInitial),
        montantPaye: totalPaiements,
        tauxExecution: (totalPaiements / Number(contrat.montantRevise || contrat.montantInitial)) * 100,
        nombreLivrables: contrat.livrables.length,
        livrablesReceptionnes,
        nombrePaiements: contrat.paiements.length,
        paiementsEffectues,
        nombreAvenants: contrat.avenants.length,
      },
    };
  }
}
