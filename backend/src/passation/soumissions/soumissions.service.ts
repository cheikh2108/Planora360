import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SoumissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(procedureId: string, fournisseurId: string, userId: string, dto: any) {
    // Vérifier que la procédure accepte encore les soumissions
    const procedure = await this.prisma.procedure.findUnique({
      where: { id: procedureId },
    });

    if (!procedure) {
      throw new NotFoundException('Procédure introuvable');
    }

    const now = new Date();
    if (procedure.dateLimite && now > procedure.dateLimite) {
      throw new ForbiddenException('La date limite de soumission est dépassée');
    }

    return this.prisma.soumission.create({
      data: {
        ...dto,
        procedureId,
        fournisseurId,
        dateDepot: new Date(),
      },
      include: {
        fournisseur: {
          select: {
            id: true,
            raisonSociale: true,
            identifiantFiscal: true,
          },
        },
        documents: true,
      },
    });
  }

  async findAll(procedureId: string, organizationId: string) {
    const procedure = await this.prisma.procedure.findFirst({
      where: {
        id: procedureId,
        organizationId,
      },
    });

    if (!procedure) {
      throw new NotFoundException('Procédure introuvable');
    }

    return this.prisma.soumission.findMany({
      where: { procedureId },
      include: {
        fournisseur: {
          select: {
            id: true,
            raisonSociale: true,
            identifiantFiscal: true,
            email: true,
          },
        },
        documents: {
          select: {
            id: true,
            nom: true,
            url: true,
          },
        },
      },
      orderBy: { dateDepot: 'asc' },
    });
  }

  async findOne(id: string, procedureId: string, organizationId: string) {
    const soumission = await this.prisma.soumission.findFirst({
      where: {
        id,
        procedureId,
        procedure: {
          organizationId,
        },
      },
      include: {
        fournisseur: true,
        documents: true,
        procedure: {
          select: {
            id: true,
            reference: true,
            objet: true,
            dateOuverture: true,
          },
        },
      },
    });

    if (!soumission) {
      throw new NotFoundException('Soumission introuvable');
    }

    return soumission;
  }
}
