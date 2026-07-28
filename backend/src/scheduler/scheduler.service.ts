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
      select: { id: true },
    });

    for (const org of organizations) {
      await this.notifications.notifyOverdueActivities(org.id);
      await this.notifications.notifyUpcomingDeadlines(org.id, 3);
    }

    this.logger.log(`Scan terminé pour ${organizations.length} organisation(s)`);
  }
}
