import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  getRetentionCutoffDate,
  UPCOMING_DEADLINE_WARNING_DAYS,
} from '../common/constants/retention.constants';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @Cron('0 8 * * *')
  async dailyAlertScan() {
    this.logger.log('Démarrage du scan quotidien des alertes...');

    const organizations = await this.prisma.organization.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    for (const org of organizations) {
      await this.notifications.notifyOverdueActivities(org.id);
      await this.notifications.notifyUpcomingDeadlines(org.id, UPCOMING_DEADLINE_WARNING_DAYS);
    }

    this.logger.log(`Scan terminé pour ${organizations.length} organisation(s)`);
  }

  @Cron('0 3 * * *')
  async cleanupOldDeletedOrganizations() {
    this.logger.log('Démarrage du nettoyage des organisations supprimées...');

    try {
      const expiredOrganizations = await this.findExpiredOrganizations();

      if (expiredOrganizations.length === 0) {
        this.logger.log('Aucune organisation à nettoyer.');
        return;
      }

      await this.permanentlyDeleteOrganizations(expiredOrganizations);
      this.logDeletedOrganizations(expiredOrganizations);
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des organisations:', error);
    }
  }

  private async findExpiredOrganizations() {
    const cutoffDate = getRetentionCutoffDate();

    return this.prisma.organization.findMany({
      where: {
        deletedAt: { lte: cutoffDate },
        NOT: { deletedAt: null },
      },
      select: { id: true, name: true },
    });
  }

  private async permanentlyDeleteOrganizations(organizations: Array<{ id: string; name: string }>) {
    const organizationIds = organizations.map(org => org.id);

    await this.prisma.$transaction([
      this.prisma.user.deleteMany({
        where: { organizationId: { in: organizationIds } },
      }),
      this.prisma.organization.deleteMany({
        where: { id: { in: organizationIds } },
      }),
    ]);
  }

  private logDeletedOrganizations(organizations: Array<{ id: string; name: string }>) {
    this.logger.log(`✅ ${organizations.length} organisation(s) supprimée(s) définitivement :`);
    organizations.forEach(org => this.logger.log(`   - ${org.name} (${org.id})`));
  }
}
