import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SecurityEventType, SecurityEventSeverity, SecurityEventStatus } from '@prisma/client';

/**
 * Security Events Service
 * Phase 4: Détection et gestion des événements de sécurité
 */

interface CreateSecurityEventDto {
  organizationId?: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SecurityEventsService {
  // Cache pour le rate limiting (brute force detection)
  private loginAttempts: Map<string, { count: number; firstAttempt: Date }> = new Map();

  constructor(private prisma: PrismaService) {
    // Nettoyage du cache toutes les 5 minutes
    setInterval(() => this.cleanupLoginAttemptsCache(), 5 * 60 * 1000);
  }

  /**
   * Créer un événement de sécurité
   */
  async create(data: CreateSecurityEventDto) {
    return this.prisma.securityEvent.create({
      data: {
        organizationId: data.organizationId,
        type: data.type,
        severity: data.severity,
        status: SecurityEventStatus.DETECTED,
        userId: data.userId,
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        description: data.description,
        metadata: data.metadata || {},
      },
    });
  }

  /**
   * Détection de brute force
   * Max 5 tentatives par email/IP en 15 minutes
   */
  async trackLoginAttempt(params: {
    email: string;
    ipAddress: string;
    success: boolean;
    userAgent?: string;
    organizationId?: string;
  }): Promise<void> {
    const { email, ipAddress, success, userAgent, organizationId } = params;

    // Si succès, nettoyer le cache pour cet email/IP
    if (success) {
      const keyEmail = `email:${email}`;
      const keyIp = `ip:${ipAddress}`;
      this.loginAttempts.delete(keyEmail);
      this.loginAttempts.delete(keyIp);
      return;
    }

    // Échec: incrémenter le compteur
    const now = new Date();
    const keyEmail = `email:${email}`;
    const keyIp = `ip:${ipAddress}`;

    // Track par email
    const attemptsEmail = this.loginAttempts.get(keyEmail);
    if (attemptsEmail) {
      const minutesSinceFirst = (now.getTime() - attemptsEmail.firstAttempt.getTime()) / 1000 / 60;

      // Si plus de 15 minutes, reset
      if (minutesSinceFirst > 15) {
        this.loginAttempts.set(keyEmail, { count: 1, firstAttempt: now });
      } else {
        attemptsEmail.count++;

        // Si ≥ 5 tentatives en 15 min → Brute force détecté
        if (attemptsEmail.count >= 5) {
          await this.create({
            organizationId,
            type: SecurityEventType.BRUTE_FORCE_LOGIN,
            severity: SecurityEventSeverity.HIGH,
            email,
            ipAddress,
            userAgent,
            description: `Brute force détecté: ${attemptsEmail.count} tentatives de connexion échouées pour ${email} depuis ${ipAddress} en ${Math.round(minutesSinceFirst)} minutes`,
            metadata: {
              attempts: attemptsEmail.count,
              duration_minutes: Math.round(minutesSinceFirst),
              first_attempt: attemptsEmail.firstAttempt.toISOString(),
            },
          });

          // Reset après détection
          this.loginAttempts.delete(keyEmail);
        }
      }
    } else {
      this.loginAttempts.set(keyEmail, { count: 1, firstAttempt: now });
    }

    // Track par IP (même logique)
    const attemptsIp = this.loginAttempts.get(keyIp);
    if (attemptsIp) {
      const minutesSinceFirst = (now.getTime() - attemptsIp.firstAttempt.getTime()) / 1000 / 60;

      if (minutesSinceFirst > 15) {
        this.loginAttempts.set(keyIp, { count: 1, firstAttempt: now });
      } else {
        attemptsIp.count++;

        if (attemptsIp.count >= 5) {
          await this.create({
            organizationId,
            type: SecurityEventType.BRUTE_FORCE_LOGIN,
            severity: SecurityEventSeverity.CRITICAL,
            ipAddress,
            userAgent,
            description: `Brute force détecté: ${attemptsIp.count} tentatives de connexion depuis l'IP ${ipAddress} en ${Math.round(minutesSinceFirst)} minutes`,
            metadata: {
              attempts: attemptsIp.count,
              duration_minutes: Math.round(minutesSinceFirst),
              first_attempt: attemptsIp.firstAttempt.toISOString(),
              suspected_emails: email,
            },
          });

          this.loginAttempts.delete(keyIp);
        }
      }
    } else {
      this.loginAttempts.set(keyIp, { count: 1, firstAttempt: now });
    }
  }

  /**
   * Détection d'accès non autorisé
   */
  async trackUnauthorizedAccess(params: {
    userId?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    resource: string;
    requiredRole?: string;
    organizationId?: string;
  }): Promise<void> {
    await this.create({
      organizationId: params.organizationId,
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecurityEventSeverity.MEDIUM,
      userId: params.userId,
      email: params.email,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      description: `Tentative d'accès non autorisé à la ressource: ${params.resource}`,
      metadata: {
        resource: params.resource,
        required_role: params.requiredRole,
      },
    });
  }

  /**
   * Recherche avec filtres
   */
  async findWithFilters(params: {
    organizationId?: string;
    type?: SecurityEventType;
    severity?: SecurityEventSeverity;
    status?: SecurityEventStatus;
    email?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
  }) {
    const limit = params.limit || 50;
    const page = params.page || 1;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.organizationId) where.organizationId = params.organizationId;
    if (params.type) where.type = params.type;
    if (params.severity) where.severity = params.severity;
    if (params.status) where.status = params.status;
    if (params.email) where.email = params.email;
    if (params.ipAddress) where.ipAddress = params.ipAddress;

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [events, total] = await Promise.all([
      this.prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.securityEvent.count({ where }),
    ]);

    return { events, total, page, limit };
  }

  /**
   * Résoudre un événement
   */
  async resolve(id: string, params: { resolvedBy: string; resolution: string }) {
    return this.prisma.securityEvent.update({
      where: { id },
      data: {
        status: SecurityEventStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy: params.resolvedBy,
        resolution: params.resolution,
      },
    });
  }

  /**
   * Marquer comme faux positif
   */
  async markAsFalsePositive(id: string, params: { resolvedBy: string; reason: string }) {
    return this.prisma.securityEvent.update({
      where: { id },
      data: {
        status: SecurityEventStatus.FALSE_POSITIVE,
        resolvedAt: new Date(),
        resolvedBy: params.resolvedBy,
        resolution: `Faux positif: ${params.reason}`,
      },
    });
  }

  /**
   * Statistiques
   */
  async getStats(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};

    const [
      total,
      byType,
      bySeverity,
      byStatus,
      recentCritical,
    ] = await Promise.all([
      this.prisma.securityEvent.count({ where }),
      this.prisma.securityEvent.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      this.prisma.securityEvent.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      this.prisma.securityEvent.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.securityEvent.count({
        where: {
          ...where,
          severity: SecurityEventSeverity.CRITICAL,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
          },
        },
      }),
    ]);

    return {
      total,
      byType: Object.fromEntries(byType.map(item => [item.type, item._count])),
      bySeverity: Object.fromEntries(bySeverity.map(item => [item.severity, item._count])),
      byStatus: Object.fromEntries(byStatus.map(item => [item.status, item._count])),
      recentCritical,
    };
  }

  /**
   * Nettoyer le cache des tentatives de connexion
   * (supprime les entrées de plus de 30 minutes)
   */
  private cleanupLoginAttemptsCache() {
    const now = new Date();
    const thirtyMinutesAgo = now.getTime() - 30 * 60 * 1000;

    for (const [key, value] of this.loginAttempts.entries()) {
      if (value.firstAttempt.getTime() < thirtyMinutesAgo) {
        this.loginAttempts.delete(key);
      }
    }
  }
}
