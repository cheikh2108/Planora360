import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;
  private frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.frontendUrl = this.config.get<string>('FRONTEND_URL') || 'https://planora360.org';

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
        from: 'PLANORA 360 <noreply@planora360.org>',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Erreur envoi email à ${to}: ${err}`);
    }
  }

  async sendWelcomeCredentials(params: {
    email: string;
    firstName: string;
    orgName: string;
    tempPassword: string;
  }) {
    if (!this.resend) {
      this.logger.log(
        `\n┌─ CREDENTIALS ──────────────────────────┐\n│ Org      : ${params.orgName}\n│ Email    : ${params.email}\n│ Password : ${params.tempPassword}\n└────────────────────────────────────────┘`,
      );
    }
    await this.sendEmail(
      params.email,
      `[PLANORA 360] Votre accès à ${params.orgName}`,
      `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
        <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)">

          <!-- Header avec logo -->
          <div style="background:linear-gradient(135deg,#0b1629 0%,#1e3a5f 100%);padding:40px 32px;text-align:center">
            <img src="${this.frontendUrl}/logo-light.svg" alt="PLANORA 360" style="height:48px;width:auto;margin-bottom:16px" />
            <h1 style="margin:0;color:white;font-size:24px;font-weight:700;letter-spacing:-0.5px">Bienvenue !</h1>
          </div>

          <!-- Corps -->
          <div style="padding:40px 32px">
            <p style="margin:0 0 24px;color:#0f172a;font-size:16px;line-height:1.6">
              Bonjour <strong>${params.firstName}</strong>,
            </p>

            <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7">
              Un compte a été créé pour vous sur <strong>PLANORA 360</strong> dans l'organisation <strong>${params.orgName}</strong>. Voici vos identifiants de connexion :
            </p>

            <!-- Carte identifiants -->
            <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:32px">
              <div style="margin-bottom:20px">
                <p style="margin:0 0 8px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Adresse e-mail</p>
                <p style="margin:0;color:#0f172a;font-size:16px;font-weight:600">${params.email}</p>
              </div>
              <div>
                <p style="margin:0 0 8px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Mot de passe temporaire</p>
                <p style="margin:0;color:#2563eb;font-size:20px;font-weight:800;letter-spacing:0.1em;font-family:'Courier New',monospace">${params.tempPassword}</p>
              </div>
            </div>

            <!-- Alerte changement mot de passe -->
            <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin-bottom:32px">
              <p style="margin:0;color:#991b1b;font-size:13px;font-weight:600;line-height:1.5">
                ⚠️ Vous devrez choisir un nouveau mot de passe lors de votre première connexion.
              </p>
            </div>

            <!-- Bouton CTA -->
            <div style="text-align:center;margin:40px 0">
              <a href="${this.frontendUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:white;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.3px;box-shadow:0 4px 6px -1px rgba(37,99,235,0.3),0 2px 4px -1px rgba(37,99,235,0.2);transition:all 0.3s ease">
                Se connecter maintenant →
              </a>
            </div>

            <!-- Lien alternatif -->
            <p style="margin:32px 0 0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6">
              Si le bouton ne fonctionne pas, copiez ce lien :<br/>
              <a href="${this.frontendUrl}" style="color:#2563eb;text-decoration:none;word-break:break-all">${this.frontendUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;text-align:center">
            <p style="margin:0;color:#94a3b8;font-size:12px">
              © 2026 PLANORA 360 — Gestion de projets et pilotage stratégique
            </p>
            <p style="margin:8px 0 0;color:#cbd5e1;font-size:11px">
              Ne pas répondre à cet email
            </p>
          </div>

        </div>
      </body>
      </html>`,
    );
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
      `[PLANORA 360] Validation requise — ${params.activityTitle}`,
      `<p>Bonjour ${validator.firstName},</p>
       <p>L'activité <strong>${params.activityTitle}</strong> est en attente de votre validation (étape : ${params.step}).</p>
       <p>Connectez-vous sur PLANORA 360 pour traiter cette demande.</p>`,
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
      `[PLANORA 360] Activité ${label} — ${params.activityTitle}`,
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
        `[PLANORA 360] Activité en retard — ${activity.title}`,
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
        `[PLANORA 360] Échéance proche — ${activity.title}`,
        `<p>Bonjour ${activity.responsible.firstName},</p>
         <p>L'activité <strong>${activity.title}</strong> arrive à échéance le ${activity.dueDate.toLocaleDateString('fr-FR')}.</p>`,
      );
    }

    this.logger.log(`Alertes échéance : ${upcoming.length} activité(s) notifiée(s)`);
  }
}
