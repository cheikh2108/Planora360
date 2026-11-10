import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { systemRoleName } from '../common/guards/roles.guard';
import {
  NotificationPreferences,
  resolveNotificationPreferences,
} from './notification-preferences';

/** Rôles autorisés à voir les événements de gestion des comptes (création, désactivation…). */
const ROLES_SEEING_ACCOUNT_EVENTS = new Set([
  'Super administrateur',
  'Administrateur',
  'Coordinateur',
  'Auditeur',
]);

/** Types d'entités dont les événements ne concernent que l'administration. */
const ADMIN_ONLY_ENTITY_TYPES = ['User'];

export const NOTIFICATIONS_MAX_LIMIT = 50;

/**
 * Fil de notifications de l'utilisateur, construit à partir du journal d'audit de son organisation.
 *
 * Contrairement à GET /audit (réservé aux formules Organisation/Entreprise et aux rôles de contrôle),
 * ce fil est ouvert à tout utilisateur connecté :
 *  - ses propres actions sont exclues (on ne se notifie pas soi-même) ;
 *  - seuls des champs sûrs sont renvoyés (pas d'IP, d'agent utilisateur ni d'anciennes/nouvelles valeurs) ;
 *  - les événements d'administration des comptes sont masqués aux rôles opérationnels ;
 *  - l'état « lu » est stocké côté serveur (User.notificationsReadAt), donc partagé entre appareils.
 */
@Injectable()
export class NotificationFeedService {
  constructor(private prisma: PrismaService) {}

  private baseWhere(user: { id: string; organizationId: string; role?: any }): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {
      organizationId: user.organizationId,
      userId: { not: user.id },
    };
    const role = systemRoleName(user);
    if (!role || !ROLES_SEEING_ACCOUNT_EVENTS.has(role)) {
      where.entityType = { notIn: ADMIN_ONLY_ENTITY_TYPES };
    }
    return where;
  }

  async list(
    user: { id: string; organizationId: string; role?: any },
    page = 1,
    limit = 20,
  ) {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), NOTIFICATIONS_MAX_LIMIT) : 20;
    const where = this.baseWhere(user);

    const me = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { notificationsReadAt: true },
    });
    const readAt = me?.notificationsReadAt ?? null;

    const [rows, total, unreadCount] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        skip: (safePage - 1) * safeLimit,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          metadata: true,
          createdAt: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.count({
        where: readAt ? { ...where, createdAt: { gt: readAt } } : where,
      }),
    ]);

    const entries = rows.map((r) => ({
      ...r,
      read: readAt ? r.createdAt <= readAt : false,
    }));

    return { entries, total, page: safePage, limit: safeLimit, unreadCount, readAt };
  }

  async markAllRead(userId: string) {
    const readAt = new Date();
    await this.prisma.user.update({
      where: { id: userId },
      data: { notificationsReadAt: readAt },
    });
    return { readAt, unreadCount: 0 };
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });
    return resolveNotificationPreferences(me?.notificationPreferences);
  }

  async updatePreferences(userId: string, changes: Partial<NotificationPreferences>) {
    const current = await this.getPreferences(userId);
    const next = resolveNotificationPreferences({ ...current, ...changes });
    await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPreferences: next },
    });
    return next;
  }
}
