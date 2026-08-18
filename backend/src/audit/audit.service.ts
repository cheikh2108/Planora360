import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(params: {
    organizationId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ?? {},
      },
    });
  }

  async findByOrganization(organizationId: string, limit = 100, page = 1) {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
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
      }),
      this.prisma.auditLog.count({ where: { organizationId } }),
    ]);

    return { entries, total, page, limit };
  }

  findByEntity(entityType: string, entityId: string, organizationId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId, organizationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
