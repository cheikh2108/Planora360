import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, userId: string, dto: any) {
    const data: any = {
      ...dto,
      organizationId,
      presidentId: userId,
    };

    // Convertir les dates string en DateTime pour Prisma
    if (data.dateSeance && typeof data.dateSeance === 'string') {
      data.dateSeance = new Date(data.dateSeance);
    }

    return this.prisma.commission.create({
      data,
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
      },
    });
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

    return this.prisma.membreCommission.delete({
      where: { id: membreId },
    });
  }
}
