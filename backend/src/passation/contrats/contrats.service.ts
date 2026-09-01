import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatusContrat } from '@prisma/client';

@Injectable()
export class ContratsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: any) {
    const count = await this.prisma.contrat.count({
      where: { organizationId },
    });
    const reference = `CONT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const data: any = {
      ...dto,
      reference,
      organizationId,
      gestionnaire: userId,
    };

    // Convertir les dates string en DateTime pour Prisma
    if (data.dateSignature && typeof data.dateSignature === 'string') {
      data.dateSignature = new Date(data.dateSignature);
    }
    if (data.dateDemarrage && typeof data.dateDemarrage === 'string') {
      data.dateDemarrage = new Date(data.dateDemarrage);
    }
    if (data.dateEcheance && typeof data.dateEcheance === 'string') {
      data.dateEcheance = new Date(data.dateEcheance);
    }
    if (data.dateReceptionProv && typeof data.dateReceptionProv === 'string') {
      data.dateReceptionProv = new Date(data.dateReceptionProv);
    }
    if (data.dateReceptionDef && typeof data.dateReceptionDef === 'string') {
      data.dateReceptionDef = new Date(data.dateReceptionDef);
    }

    return this.prisma.contrat.create({
      data,
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
    });
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

  async update(id: string, organizationId: string, dto: any) {
    await this.findOne(id, organizationId);

    const data: any = { ...dto };

    // Convertir les dates string en DateTime pour Prisma
    if (data.dateSignature && typeof data.dateSignature === 'string') {
      data.dateSignature = new Date(data.dateSignature);
    }
    if (data.dateDemarrage && typeof data.dateDemarrage === 'string') {
      data.dateDemarrage = new Date(data.dateDemarrage);
    }
    if (data.dateEcheance && typeof data.dateEcheance === 'string') {
      data.dateEcheance = new Date(data.dateEcheance);
    }
    if (data.dateReceptionProv && typeof data.dateReceptionProv === 'string') {
      data.dateReceptionProv = new Date(data.dateReceptionProv);
    }
    if (data.dateReceptionDef && typeof data.dateReceptionDef === 'string') {
      data.dateReceptionDef = new Date(data.dateReceptionDef);
    }

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
