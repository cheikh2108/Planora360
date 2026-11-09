import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: CreateCommissionDto) {
    // La procédure doit appartenir à l'organisation
    const procedure = await this.prisma.procedure.findFirst({
      where: { id: dto.procedureId, organizationId },
      select: { id: true },
    });
    if (!procedure) throw new NotFoundException('Procédure introuvable');

    const presidentId = dto.presidentId ?? userId;
    await this.assertOrganizationMember(presidentId, organizationId);

    return this.prisma.commission.create({
      data: {
        procedureId: dto.procedureId,
        nom: dto.nom,
        type: dto.type,
        dateSeance: new Date(dto.dateSeance),
        presidentId,
        // Le président est membre de droit (peut évaluer les offres)
        membres: { create: [{ userId: presidentId, role: 'PRESIDENT' }] },
      },
      include: {
        president: { select: { id: true, firstName: true, lastName: true } },
        procedure: { select: { id: true, reference: true, objet: true } },
        membres: true,
      },
    });
  }

  /** L'utilisateur doit être un membre actif de l'organisation. */
  private async assertOrganizationMember(userId: string, organizationId: string) {
    const count = await this.prisma.user.count({
      where: { id: userId, organizationId, deletedAt: null, isActive: true },
    });
    if (!count) throw new BadRequestException('Cet utilisateur n\'appartient pas à votre organisation');
  }

  async findAll(organizationId: string) {
    return this.prisma.commission.findMany({
      where: { procedure: { organizationId } },
      include: {
        president: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        procedure: {
          select: {
            id: true,
            reference: true,
            objet: true,
          },
        },
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
        _count: {
          select: {
            evaluations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const commission = await this.prisma.commission.findFirst({
      where: {
        id,
        procedure: {
          organizationId,
        },
      },
      include: {
        president: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        procedure: true,
        membres: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        evaluations: {
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
        },
      },
    });

    if (!commission) {
      throw new NotFoundException('Commission introuvable');
    }

    return commission;
  }

  async addMembre(commissionId: string, organizationId: string, userId: string, role: string) {
    await this.findOne(commissionId, organizationId);
    await this.assertOrganizationMember(userId, organizationId);

    const existing = await this.prisma.membreCommission.findFirst({ where: { commissionId, userId } });
    if (existing) throw new ConflictException('Cet utilisateur est déjà membre de la commission');

    return this.prisma.membreCommission.create({
      data: {
        commissionId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async removeMembre(commissionId: string, membreId: string, organizationId: string) {
    await this.findOne(commissionId, organizationId);

    // Le membre doit appartenir à CETTE commission
    const membre = await this.prisma.membreCommission.findFirst({ where: { id: membreId, commissionId } });
    if (!membre) throw new NotFoundException('Membre introuvable');

    return this.prisma.membreCommission.delete({
      where: { id: membreId },
    });
  }
}
