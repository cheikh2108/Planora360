import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
const UAParser = require('ua-parser-js');

interface CreateSessionParams {
  userId: string;
  ipAddress: string;
  userAgent?: string;
  expiresAt: Date;
}

interface SessionFilters {
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session record
   */
  async createSession(params: CreateSessionParams) {
    const { userId, ipAddress, userAgent, expiresAt } = params;

    // Parse User-Agent
    const parsed = this.parseUserAgent(userAgent);

    return this.prisma.session.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        expiresAt,
        deviceName: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        // Location will be enriched via IP geolocation API if needed
        country: null,
        city: null,
        metadata: {},
      },
    });
  }

  /**
   * Parse User-Agent string to extract device, browser, OS
   */
  private parseUserAgent(userAgent?: string) {
    if (!userAgent) {
      return { device: null, browser: null, os: null };
    }

    const parser = new UAParser(userAgent);

    const device = parser.getDevice().model || parser.getDevice().type || null;
    const browser = parser.getBrowser().name
      ? `${parser.getBrowser().name} ${parser.getBrowser().version || ''}`.trim()
      : null;
    const os = parser.getOS().name
      ? `${parser.getOS().name} ${parser.getOS().version || ''}`.trim()
      : null;

    return { device, browser, os };
  }

  /**
   * Update last activity timestamp for a session
   */
  async updateActivity(sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });
  }

  /**
   * Get all active sessions with filters (Super Admin)
   */
  async findActiveSessions(filters: SessionFilters) {
    const {
      userId,
      organizationId,
      ipAddress,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {
      expiresAt: { gte: new Date() }, // Only active sessions
    };

    if (userId) where.userId = userId;
    if (ipAddress) where.ipAddress = { contains: ipAddress };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Filter by organization
    if (organizationId) {
      where.user = { organizationId };
    }

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              organizationId: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { lastActivityAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.session.count({ where }),
    ]);

    return {
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get active sessions for a specific user
   */
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  /**
   * Get session statistics
   */
  async getStats() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalActive,
      activeLast24h,
      totalUsers,
      byOrganization,
    ] = await Promise.all([
      // Total active sessions
      this.prisma.session.count({
        where: { expiresAt: { gte: now } },
      }),

      // Active in last 24h
      this.prisma.session.count({
        where: {
          expiresAt: { gte: now },
          lastActivityAt: { gte: oneDayAgo },
        },
      }),

      // Unique users with active sessions
      this.prisma.session.findMany({
        where: { expiresAt: { gte: now } },
        select: { userId: true },
        distinct: ['userId'],
      }).then(results => results.length),

      // Sessions by organization (top 10)
      this.prisma.session.groupBy({
        by: ['userId'],
        where: { expiresAt: { gte: now } },
        _count: { id: true },
      }).then(async (results) => {
        // Get organization info for top users
        const topUserIds = results.slice(0, 10).map(r => r.userId);
        const users = await this.prisma.user.findMany({
          where: { id: { in: topUserIds } },
          select: {
            id: true,
            organizationId: true,
            organization: { select: { id: true, name: true } },
          },
        });

        // Group by organization
        const orgMap = new Map<string, { name: string; count: number }>();
        results.forEach((result) => {
          const user = users.find(u => u.id === result.userId);
          if (user?.organization) {
            const existing = orgMap.get(user.organization.id);
            if (existing) {
              existing.count += result._count.id;
            } else {
              orgMap.set(user.organization.id, {
                name: user.organization.name,
                count: result._count.id,
              });
            }
          }
        });

        return Array.from(orgMap.entries())
          .map(([id, data]) => ({ organizationId: id, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }),
    ]);

    return {
      totalActive,
      activeLast24h,
      totalUsers,
      byOrganization,
    };
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string) {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeUserSessions(userId: string) {
    const result = await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { count: result.count };
  }

  /**
   * Cleanup expired sessions (runs every hour)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions() {
    const result = await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (result.count > 0) {
      console.log(`[Sessions] Cleaned up ${result.count} expired sessions`);
    }
  }
}
