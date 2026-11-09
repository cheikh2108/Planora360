import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { StatusProcedure } from '@prisma/client';
import { CreateSoumissionDto } from './dto/create-soumission.dto';
import { isUniqueViolation } from '../../common/utils/reference';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SoumissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(procedureId: string, organizationId: string, dto: CreateSoumissionDto) {
    // La procédure doit appartenir à l'organisation et être ouverte aux offres
    const procedure = await this.prisma.procedure.findFirst({
      where: { id: procedureId, organizationId },
    });
    if (!procedure) {
      throw new NotFoundException('Procédure introuvable');
    }
    if (procedure.status !== StatusProcedure.PUBLIEE && procedure.status !== StatusProcedure.EN_COURS) {
      throw new BadRequestException('La procédure n\'accepte pas d\'offres (elle doit être publiée ou en cours)');
    }
    if (procedure.dateLimite && new Date() > procedure.dateLimite) {
      throw new ForbiddenException('La date limite de soumission est dépassée');
    }

    // Le fournisseur doit appartenir à l'organisation et ne pas être suspendu ou sur liste noire
    const fournisseur = await this.prisma.fournisseur.findFirst({
      where: { id: dto.fournisseurId, organizationId },
    });
    if (!fournisseur) {
      throw new NotFoundException('Fournisseur introuvable dans votre organisation');
    }
    if (fournisseur.status === 'SUSPENDU' || fournisseur.status === 'BLACKLISTE') {
      throw new BadRequestException('Ce fournisseur est suspendu ou sur liste noire');
    }

    try {
      return await this.prisma.soumission.create({
        data: {
          procedureId,
          fournisseurId: fournisseur.id,
          numeroDepot: dto.numeroDepot,
          montantTechnique: dto.montantTechnique,
          montantFinancier: dto.montantFinancier,
          montantTotal: dto.montantTotal,
          devise: dto.devise ?? 'XOF',
          conformeAdmin: dto.conformeAdmin,
          conformeTechnique: dto.conformeTechnique,
          conformeFinancier: dto.conformeFinancier,
          horsDelai: dto.horsDelai ?? false,
          status: 'DEPOSEE',
          dateDepot: new Date(),
        },
        include: {
          fournisseur: { select: { id: true, raisonSociale: true, identifiantFiscal: true } },
          documents: true,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(`Le numéro de dépôt ${dto.numeroDepot} est déjà utilisé pour cette procédure`);
      }
      throw error;
    }
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
