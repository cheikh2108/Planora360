import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY non configuré — emails désactivés');
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`[EMAIL] À: ${to} | Sujet: ${subject}`);
      return;
    }
    try {
      await this.resend.emails.send({
        from: 'ATAABA Pilot <noreply@ataaba.com>',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Erreur envoi email à ${to}: ${err}`);
    }
  }

  async notifyValidationPending(params: {
    activityId: string;
    activityTitle: string;
    step: string;
    validatorId: string;
    organizationId: string;
  }) {
    const validator = await this.prisma.user.findUnique({
      where: { id: params.validatorId },
      select: { email: true, firstName: true },
    });
    if (!validator) return;

    await this.sendEmail(
      validator.email,
      `[ATAABA Pilot] Validation requise — ${params.activityTitle}`,
      `<p>Bonjour ${validator.firstName},</p>
       <p>L'activité <strong>${params.activityTitle}</strong> est en attente de votre validation (étape : ${params.step}).</p>
       <p>Connectez-vous sur ATAABA Pilot pour traiter cette demande.</p>`,
    );
  }

  async notifyValidationResult(params: {
    activityTitle: string;
    step: string;
    decision: string;
    comment: string | null;
    responsibleId: string;
  }) {
    const responsible = await this.prisma.user.findUnique({
      where: { id: params.responsibleId },
      select: { email: true, firstName: true },
    });
    if (!responsible) return;

    const label = params.decision === 'APPROUVE' ? '✅ Approuvée' : '❌ Rejetée';
    await this.sendEmail(
      responsible.email,
      `[ATAABA Pilot] Activité ${label} — ${params.activityTitle}`,
      `<p>Bonjour ${responsible.firstName},</p>
       <p>L'activité <strong>${params.activityTitle}</strong> a été <strong>${label}</strong> à l'étape ${params.step}.</p>
       ${params.comment ? `<p>Commentaire : ${params.comment}</p>` : ''}`,
    );
  }

  async notifyOverdueActivities(organizationId: string) {
    const overdue = await this.prisma.activity.findMany({
      where: {
        organizationId,
        dueDate: { lt: new Date() },
        status: { notIn: ['VALIDEE', 'ANNULEE', 'TERMINEE'] },
      },
      include: {
        responsible: { select: { email: true, firstName: true } },
      },
    });

    for (const activity of overdue) {
      await this.prisma.activity.update({
        where: { id: activity.id },
        data: { status: 'EN_RETARD' },
      });
      await this.sendEmail(
        activity.responsible.email,
        `[ATAABA Pilot] Activité en retard — ${activity.title}`,
        `<p>Bonjour ${activity.responsible.firstName},</p>
         <p>L'activité <strong>${activity.title}</strong> est en retard (échéance : ${activity.dueDate.toLocaleDateString('fr-FR')}).</p>`,
      );
    }

    this.logger.log(`Alertes retard : ${overdue.length} activité(s) notifiée(s)`);
  }

  async notifyUpcomingDeadlines(organizationId: string, daysAhead = 3) {
    const limit = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    const upcoming = await this.prisma.activity.findMany({
      where: {
        organizationId,
        dueDate: { gte: new Date(), lte: limit },
        status: { notIn: ['VALIDEE', 'ANNULEE', 'TERMINEE', 'EN_RETARD'] },
      },
      include: { responsible: { select: { email: true, firstName: true } } },
    });

    for (const activity of upcoming) {
      await this.sendEmail(
        activity.responsible.email,
        `[ATAABA Pilot] Échéance proche — ${activity.title}`,
        `<p>Bonjour ${activity.responsible.firstName},</p>
         <p>L'activité <strong>${activity.title}</strong> arrive à échéance le ${activity.dueDate.toLocaleDateString('fr-FR')}.</p>`,
      );
    }

    this.logger.log(`Alertes échéance : ${upcoming.length} activité(s) notifiée(s)`);
  }
}
