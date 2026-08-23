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
    // Phase 3: Enhanced audit fields
    ipAddress?: string | null;
    userAgent?: string | null;
    requestId?: string | null;
    oldValues?: Record<string, any> | null;
    newValues?: Record<string, any> | null;
  }) {
    return this.prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ?? {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestId: params.requestId,
        oldValues: params.oldValues ?? undefined,
        newValues: params.newValues ?? undefined,
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

  /**
   * Advanced search with filters (Phase 3)
   * For Super Admin interface
   */
  async findWithFilters(params: {
    organizationId?: string;
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    requestId?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
  }) {
    const limit = params.limit || 100;
    const page = params.page || 1;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.organizationId) where.organizationId = params.organizationId;
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = { contains: params.action };
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.requestId) where.requestId = params.requestId;
    if (params.ipAddress) where.ipAddress = params.ipAddress;

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [entries, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
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
      this.prisma.auditLog.count({ where }),
    ]);

    return { entries, total, page, limit };
  }
}
