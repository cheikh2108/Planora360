import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Tous les jours à 8h00 : scanner les retards et échéances proches
  @Cron('0 8 * * *')
  async dailyAlertScan() {
    this.logger.log('Démarrage du scan quotidien des alertes...');

    const organizations = await this.prisma.organization.findMany({
      where: { deletedAt: null }, // Exclure les organisations soft deleted
      select: { id: true },
    });

    for (const org of organizations) {
      await this.notifications.notifyOverdueActivities(org.id);
      await this.notifications.notifyUpcomingDeadlines(org.id, 3);
    }

    this.logger.log(`Scan terminé pour ${organizations.length} organisation(s)`);
  }

  // Tous les jours à 3h00 : nettoyer les organisations supprimées depuis plus de 90 jours
  @Cron('0 3 * * *')
  async cleanupOldDeletedOrganizations() {
    this.logger.log('Démarrage du nettoyage des organisations supprimées...');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
      // 1. Compter les organisations à supprimer
      const toDelete = await this.prisma.organization.count({
        where: {
          deletedAt: { lte: ninetyDaysAgo },
          NOT: { deletedAt: null },
        },
      });

      if (toDelete === 0) {
        this.logger.log('Aucune organisation à nettoyer.');
        return;
      }

      // 2. Récupérer les IDs pour supprimer les users en cascade
      const orgIds = await this.prisma.organization.findMany({
        where: {
          deletedAt: { lte: ninetyDaysAgo },
          NOT: { deletedAt: null },
        },
        select: { id: true, name: true },
      });

      // 3. Suppression définitive en transaction
      await this.prisma.$transaction([
        // D'abord supprimer tous les users des organisations concernées
        this.prisma.user.deleteMany({
          where: {
            organizationId: { in: orgIds.map(o => o.id) },
          },
        }),
        // Puis supprimer les organisations
        this.prisma.organization.deleteMany({
          where: {
            id: { in: orgIds.map(o => o.id) },
          },
        }),
      ]);

      this.logger.log(`✅ ${toDelete} organisation(s) supprimée(s) définitivement (>90 jours) :`);
      orgIds.forEach(org => this.logger.log(`   - ${org.name} (${org.id})`));
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des organisations:', error);
    }
  }
}
