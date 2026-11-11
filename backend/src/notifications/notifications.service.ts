import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { Resend } from 'resend';
import { EmailTemplates } from './email-templates';
import { wantsEmail } from './notification-preferences';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;
  private frontendUrl: string;
  private emailTemplates: EmailTemplates;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    // FRONTEND_URL peut lister plusieurs origines (CORS) : les liens des e-mails utilisent la première
    this.frontendUrl = (this.config.get<string>('FRONTEND_URL') || 'https://planora360.org').split(',')[0].trim();
    this.emailTemplates = new EmailTemplates(this.frontendUrl);

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
        from: 'PLANORA 360 <contact@planora360.org>',
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

    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px;line-height:1.6">
        Bonjour <strong>${this.esc(params.firstName)}</strong>,
      </p>

      <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7">
        Un compte a été créé pour vous sur <strong>PLANORA 360</strong> dans l'organisation <strong>${this.esc(params.orgName)}</strong>. Voici vos identifiants de connexion :
      </p>

      ${this.emailTemplates.infoCard({
        rows: [
          { label: 'Adresse e-mail', value: this.esc(params.email) },
          { label: 'Mot de passe temporaire', value: `<span style="color:#2563eb;font-size:18px;font-weight:800;letter-spacing:0.1em;font-family:'Courier New',monospace">${params.tempPassword}</span>` },
        ],
      })}

      ${this.emailTemplates.alert({
        type: 'warning',
        message: 'Vous devrez choisir un nouveau mot de passe lors de votre première connexion.',
      })}

      <div style="text-align:center;margin:32px 0 24px">
        ${this.emailTemplates.button({
          text: 'Se connecter maintenant →',
          url: `${this.frontendUrl}/auth/login`,
        })}
      </div>

      <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6">
        Si le bouton ne fonctionne pas, <a href="${this.frontendUrl}/auth/login" style="color:#2563eb;text-decoration:underline">${this.frontendUrl}/auth/login</a>
      </p>
    `;

    await this.sendEmail(
      params.email,
      `[PLANORA 360] Votre accès à ${params.orgName}`,
      this.emailTemplates.base({
        title: 'Bienvenue !',
        preheader: `Votre compte PLANORA 360 est prêt dans l'organisation ${this.esc(params.orgName)}`,
        content,
        headerGradient: 'linear-gradient(135deg, #0b1629 0%, #1e3a5f 100%)',
      }),
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
      select: { email: true, firstName: true, notificationPreferences: true },
    });
    if (!validator || !wantsEmail(validator.notificationPreferences, 'validationRequests')) return;

    const validationUrl = `${this.frontendUrl}/activities/${params.activityId}`;

    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Bonjour <strong>${this.esc(validator.firstName)}</strong>,
      </p>

      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        L'activité <strong>${this.esc(params.activityTitle)}</strong> est en attente de votre validation.
      </p>

      ${this.emailTemplates.infoCard({
        rows: [
          { label: 'Activité', value: this.esc(params.activityTitle) },
          { label: 'Étape', value: this.esc(params.step) },
        ],
      })}

      ${this.emailTemplates.alert({
        type: 'warning',
        message: 'Cette demande de validation nécessite votre attention.',
      })}

      <div style="text-align:center;margin:32px 0 24px">
        ${this.emailTemplates.button({
          text: 'Traiter la validation →',
          url: validationUrl,
          color: '#f59e0b',
        })}
      </div>
    `;

    await this.sendEmail(
      validator.email,
      `[PLANORA 360] Validation requise — ${params.activityTitle}`,
      this.emailTemplates.base({
        title: 'Validation en attente',
        preheader: `L'activité ${this.esc(params.activityTitle)} nécessite votre validation`,
        content,
        headerGradient: 'linear-gradient(135deg, #0b1629 0%, #1e3a5f 100%)',
      }),
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
      select: { email: true, firstName: true, notificationPreferences: true },
    });
    if (!responsible || !wantsEmail(responsible.notificationPreferences, 'validationResults')) return;

    const isApproved = params.decision === 'APPROUVE';
    const statusLabel = isApproved ? 'Approuvée' : 'Rejetée';
    const statusIcon = isApproved ? '✅' : '❌';

    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Bonjour <strong>${this.esc(responsible.firstName)}</strong>,
      </p>

      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        L'activité <strong>${this.esc(params.activityTitle)}</strong> a été <strong>${statusLabel.toLowerCase()}</strong> à l'étape <strong>${this.esc(params.step)}</strong>.
      </p>

      ${this.emailTemplates.infoCard({
        rows: [
          { label: 'Activité', value: this.esc(params.activityTitle) },
          { label: 'Étape', value: this.esc(params.step) },
          { label: 'Décision', value: `<strong style="color:${isApproved ? '#10b981' : '#ef4444'}">${statusIcon} ${statusLabel}</strong>` },
        ],
      })}

      ${
        params.comment
          ? `
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="margin:0 0 12px;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Commentaire du validateur</h3>
          <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.6;white-space:pre-wrap">${this.esc(params.comment)}</p>
        </div>
      `
          : ''
      }

      ${this.emailTemplates.alert({
        type: isApproved ? 'success' : 'error',
        message: isApproved
          ? 'Vous pouvez maintenant poursuivre le traitement de cette activité.'
          : 'Veuillez prendre en compte les remarques du validateur et soumettre à nouveau si nécessaire.',
      })}
    `;

    await this.sendEmail(
      responsible.email,
      `[PLANORA 360] Activité ${statusLabel} — ${params.activityTitle}`,
      this.emailTemplates.base({
        title: `Activité ${statusLabel}`,
        preheader: `L'activité ${this.esc(params.activityTitle)} a été ${statusLabel.toLowerCase()}`,
        content,
        headerGradient: 'linear-gradient(135deg, #0b1629 0%, #1e3a5f 100%)',
      }),
    );
  }

  async notifyOverdueActivities(organizationId: string) {
    const overdue = await this.prisma.activity.findMany({
      where: {
        organizationId,
        dueDate: { lt: new Date() },
        // EN_RETARD exclu : l'alerte part une seule fois, au passage en retard (et non chaque matin)
        status: { notIn: ['VALIDEE', 'ANNULEE', 'TERMINEE', 'EN_RETARD'] },
      },
      include: {
        responsible: { select: { email: true, firstName: true, id: true, notificationPreferences: true } },
      },
    });

    for (const activity of overdue) {
      await this.prisma.activity.update({
        where: { id: activity.id },
        data: { status: 'EN_RETARD' },
      });
      if (!wantsEmail(activity.responsible.notificationPreferences, 'overdueActivities')) continue;

      const activityUrl = `${this.frontendUrl}/activities/${activity.id}`;
      const daysLate = Math.floor((Date.now() - activity.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const content = `
        <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
          Bonjour <strong>${this.esc(activity.responsible.firstName)}</strong>,
        </p>

        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
          L'activité <strong>${this.esc(activity.title)}</strong> est maintenant <strong>en retard</strong>.
        </p>

        ${this.emailTemplates.infoCard({
          rows: [
            { label: 'Activité', value: this.esc(activity.title) },
            { label: 'Échéance initiale', value: activity.dueDate.toLocaleDateString('fr-FR') },
            { label: 'Retard', value: `<strong style="color:#ef4444">${daysLate} jour${daysLate > 1 ? 's' : ''}</strong>` },
          ],
        })}

        ${this.emailTemplates.alert({
          type: 'error',
          message: 'Cette activité nécessite une attention immédiate. Veuillez mettre à jour son statut ou sa date d\'échéance.',
        })}

        <div style="text-align:center;margin:32px 0 24px">
          ${this.emailTemplates.button({
            text: 'Voir l\'activité →',
            url: activityUrl,
          })}
        </div>
      `;

      await this.sendEmail(
        activity.responsible.email,
        `[PLANORA 360] Activité en retard — ${activity.title}`,
        this.emailTemplates.base({
          title: 'Activité en retard',
          preheader: `L'activité ${this.esc(activity.title)} a dépassé sa date d'échéance`,
          content,
          headerGradient: 'linear-gradient(135deg, #0b1629 0%, #1e3a5f 100%)',
        }),
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
      include: { responsible: { select: { email: true, firstName: true, id: true, notificationPreferences: true } } },
    });

    for (const activity of upcoming) {
      if (!wantsEmail(activity.responsible.notificationPreferences, 'upcomingDeadlines')) continue;
      const activityUrl = `${this.frontendUrl}/activities/${activity.id}`;
      const daysRemaining = Math.ceil((activity.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const urgencyMessage =
        daysRemaining === 0
          ? "L'échéance est <strong>aujourd'hui</strong>"
          : daysRemaining === 1
            ? "L'échéance est <strong>demain</strong>"
            : `Il reste <strong>${daysRemaining} jours</strong> avant l'échéance`;

      const content = `
        <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
          Bonjour <strong>${this.esc(activity.responsible.firstName)}</strong>,
        </p>

        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
          L'activité <strong>${this.esc(activity.title)}</strong> arrive bientôt à échéance.
        </p>

        ${this.emailTemplates.infoCard({
          rows: [
            { label: 'Activité', value: this.esc(activity.title) },
            { label: 'Date d\'échéance', value: activity.dueDate.toLocaleDateString('fr-FR') },
            { label: 'Temps restant', value: `<strong style="color:#f59e0b">${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}</strong>` },
          ],
        })}

        ${this.emailTemplates.alert({
          type: 'warning',
          message: `${urgencyMessage}. Assurez-vous d'avoir prévu le temps nécessaire pour finaliser cette activité.`,
        })}

        <div style="text-align:center;margin:32px 0 24px">
          ${this.emailTemplates.button({
            text: 'Voir l\'activité →',
            url: activityUrl,
          })}
        </div>
      `;

      await this.sendEmail(
        activity.responsible.email,
        `[PLANORA 360] Échéance proche — ${activity.title}`,
        this.emailTemplates.base({
          title: 'Échéance proche',
          preheader: `L'activité ${this.esc(activity.title)} arrive à échéance le ${activity.dueDate.toLocaleDateString('fr-FR')}`,
          content,
          headerGradient: 'linear-gradient(135deg, #0b1629 0%, #1e3a5f 100%)',
        }),
      );
    }

    this.logger.log(`Alertes échéance : ${upcoming.length} activité(s) notifiée(s)`);
  }

  async sendEmailVerification(params: {
    email: string;
    firstName: string;
    token: string;
  }) {
    const verificationUrl = `${this.frontendUrl}/verify-email/${params.token}`;

    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Bonjour <strong>${this.esc(params.firstName)}</strong>,
      </p>

      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        Merci d'avoir choisi <strong>PLANORA 360</strong> ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
      </p>

      <div style="text-align:center;margin:32px 0">
        ${this.emailTemplates.button({
          text: 'Vérifier mon email',
          url: verificationUrl,
          color: '#2563eb',
        })}
      </div>

      ${this.emailTemplates.divider()}

      <p style="margin:24px 0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6">
        Si le bouton ne fonctionne pas, copiez ce lien :<br/>
        <a href="${verificationUrl}" style="color:#2563eb;text-decoration:none;word-break:break-all;font-size:12px">${verificationUrl}</a>
      </p>

      ${this.emailTemplates.alert({
        type: 'error',
        message: 'Ce lien expire dans 24 heures.',
      })}
    `;

    await this.sendEmail(
      params.email,
      '[PLANORA 360] Vérifiez votre adresse email',
      this.emailTemplates.base({
        title: 'Vérifiez votre email',
        preheader: 'Activez votre compte PLANORA 360 en vérifiant votre email',
        content,
        headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      }),
    );
  }

  /**
   * Notifier le SuperAdmin d'une nouvelle inscription (en attente de validation)
   */
  async sendNewRegistrationToAdmin(params: {
    organizationName: string;
    organizationId: string;
    plan: string;
    billingCycle: string;
    userEmail: string;
    userName: string;
  }) {
    const adminEmail = this.config.get<string>('SUPPORT_EMAIL') || 'admin@ataaba.com';
    const frontendUrl = this.frontendUrl;

    const planLabels = {
      INDIVIDUEL: 'Individuel',
      PRO: 'Pro',
      EQUIPE: 'Équipe',
      ORGANISATION: 'Organisation',
      ENTERPRISE: 'Enterprise',
    };

    const cycleLabel = params.billingCycle === 'YEARLY' ? 'Annuel' : 'Mensuel';

    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Une nouvelle inscription est en attente de validation :
      </p>

      ${this.emailTemplates.infoCard({
        title: 'Informations organisation',
        rows: [
          { label: 'Organisation', value: `<strong>${this.esc(params.organizationName)}</strong>` },
          { label: 'ID', value: `<code>${this.esc(params.organizationId)}</code>` },
          { label: 'Plan', value: planLabels[params.plan] || params.plan },
          { label: 'Cycle', value: cycleLabel },
        ],
      })}

      ${this.emailTemplates.infoCard({
        title: 'Utilisateur principal',
        rows: [
          { label: 'Nom', value: this.esc(params.userName) },
          { label: 'Email', value: `<a href="mailto:${this.esc(params.userEmail)}" style="color:#2563eb;text-decoration:none">${this.esc(params.userEmail)}</a>` },
        ],
      })}

      ${this.emailTemplates.alert({
        type: 'warning',
        message: 'Cette organisation est en attente de validation. Connectez-vous à l\'admin pour l\'approuver ou la rejeter.',
      })}

      <div style="text-align:center;margin:32px 0 24px">
        ${this.emailTemplates.button({
          text: 'Se connecter à l\'admin →',
          url: `${frontendUrl}/auth/login`,
        })}
      </div>

      <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6">
        <strong>Instructions :</strong><br/>
        1. Connectez-vous avec vos identifiants SuperAdmin<br/>
        2. Allez dans la gestion des organisations<br/>
        3. Recherchez l'organisation <strong>${this.esc(params.organizationName)}</strong> (ID: ${this.esc(params.organizationId)})<br/>
        4. Cliquez sur "Approuver" pour activer l'organisation<br/><br/>
        L'utilisateur recevra automatiquement ses identifiants par email après approbation.
      </p>
    `;

    await this.sendEmail(
      adminEmail,
      `[PLANORA 360] Nouvelle inscription - ${params.organizationName}`,
      this.emailTemplates.base({
        title: '🆕 Nouvelle inscription',
        preheader: `${this.esc(params.organizationName)} demande un accès au plan ${planLabels[params.plan]}`,
        content,
        showLogo: false,
      }),
    );
  }

  /** Échappe une valeur saisie par un utilisateur avant de l'insérer dans le HTML d'un e-mail. */
  private esc(v: string | null | undefined): string {
    return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Lien « mot de passe oublié ».
   */
  async sendPasswordResetLink(params: { email: string; firstName: string; resetUrl: string; expiresInMinutes: number }) {
    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Bonjour <strong>${this.esc(params.firstName)}</strong>,
      </p>
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        Une demande de réinitialisation du mot de passe de votre compte PLANORA 360 a été faite.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
      </p>
      <div style="text-align:center;margin:32px 0">
        ${this.emailTemplates.button({ text: 'Choisir un nouveau mot de passe', url: params.resetUrl, color: '#2563eb' })}
      </div>
      <p style="margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.6">
        Ce lien est valable <strong>${params.expiresInMinutes} minutes</strong> et ne peut servir qu'une fois.
      </p>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">
        Vous n'êtes pas à l'origine de cette demande ? Ignorez cet e-mail : votre mot de passe reste inchangé.
      </p>
    `;

    await this.sendEmail(
      params.email,
      '[PLANORA 360] Réinitialisation de votre mot de passe',
      this.emailTemplates.base({
        title: 'Mot de passe oublié',
        preheader: `Lien valable ${params.expiresInMinutes} minutes`,
        content,
      }),
    );
  }

  /**
   * Avis de changement du mot de passe (après réinitialisation).
   */
  async sendPasswordChangedNotice(params: { email: string; firstName: string }) {
    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Bonjour <strong>${this.esc(params.firstName)}</strong>,
      </p>
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        Le mot de passe de votre compte PLANORA 360 vient d'être modifié. Par sécurité, toutes vos sessions
        ouvertes ont été fermées : reconnectez-vous avec votre nouveau mot de passe.
      </p>
      <p style="margin:0;color:#b91c1c;font-size:14px;line-height:1.6">
        Si vous n'êtes pas à l'origine de ce changement, contactez immédiatement
        <a href="mailto:support@planora360.org" style="color:#b91c1c">support@planora360.org</a>.
      </p>
    `;

    await this.sendEmail(
      params.email,
      '[PLANORA 360] Votre mot de passe a été modifié',
      this.emailTemplates.base({
        title: 'Mot de passe modifié',
        preheader: 'Toutes vos sessions ont été fermées',
        content,
      }),
    );
  }

  /**
   * Confirmation de paiement d'une formule (envoyée à l'administrateur qui a payé).
   */
  async sendPaymentConfirmation(params: {
    email: string;
    firstName: string;
    organizationName: string;
    planLabel: string;
    amount: number;
    currency: string;
    reference: string;
    periodEnd: Date;
  }) {
    // Les valeurs saisies par les utilisateurs sont échappées avant d'entrer dans le HTML
    const esc = (v: string) =>
      v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const amount = `${new Intl.NumberFormat('fr-FR').format(params.amount)} ${params.currency === 'XOF' ? 'FCFA' : esc(params.currency)}`;
    const until = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(params.periodEnd);

    const content = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Bonjour <strong>${esc(params.firstName)}</strong>,
      </p>
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        Votre paiement a bien été reçu. La formule <strong>${esc(params.planLabel)}</strong> est active pour
        <strong>${esc(params.organizationName)}</strong>.
      </p>
      ${this.emailTemplates.infoCard({
        title: 'Récapitulatif',
        rows: [
          { label: 'Formule', value: esc(params.planLabel) },
          { label: 'Montant payé', value: amount },
          { label: 'Valable jusqu\'au', value: until },
          { label: 'Référence', value: esc(params.reference) },
        ],
      })}
      <div style="text-align:center;margin:32px 0">
        ${this.emailTemplates.button({ text: 'Ouvrir PLANORA 360', url: `${this.frontendUrl}/settings`, color: '#2563eb' })}
      </div>
    `;

    await this.sendEmail(
      params.email,
      `[PLANORA 360] Paiement confirmé - formule ${params.planLabel}`,
      this.emailTemplates.base({
        title: 'Paiement confirmé',
        preheader: `Formule ${params.planLabel} active jusqu'au ${until}`,
        content,
        headerGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      }),
    );
  }

  async sendQuoteRequest(params: {
    organizationName: string;
    plan: string;
    billingCycle: string;
    fullName: string;
    email: string;
    phone?: string;
    estimatedUsers?: number;
    customMessage?: string;
  }) {
    const supportEmail = this.config.get<string>('SUPPORT_EMAIL') || 'contact@planora360.org';

    const planLabels = {
      PRO: 'Pro',
      EQUIPE: 'Équipe',
      ORGANISATION: 'Organisation',
      ENTERPRISE: 'Enterprise',
    };

    const cycleLabel = params.billingCycle === 'YEARLY' ? 'Annuel' : 'Mensuel';

    // 1. Email à l'équipe support
    const supportRows = [
      { label: 'Organisation', value: this.esc(params.organizationName) },
      { label: 'Contact', value: this.esc(params.fullName) },
      { label: 'Email', value: `<a href="mailto:${this.esc(params.email)}" style="color:#2563eb;text-decoration:none">${this.esc(params.email)}</a>` },
    ];
    if (params.phone) {
      supportRows.push({ label: 'Téléphone', value: this.esc(params.phone) });
    }

    const planRows = [
      { label: 'Plan', value: `<strong>${planLabels[params.plan] || params.plan}</strong>` },
      { label: 'Facturation', value: cycleLabel },
    ];
    if (params.estimatedUsers) {
      planRows.push({ label: 'Utilisateurs estimés', value: params.estimatedUsers.toString() });
    }

    const supportContent = `
      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        Nouvelle demande de devis reçue. Voici les détails du client :
      </p>

      ${this.emailTemplates.infoCard({ title: 'Informations client', rows: supportRows })}
      ${this.emailTemplates.infoCard({ title: 'Formule demandée', rows: planRows })}

      ${
        params.customMessage
          ? `
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="margin:0 0 12px;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Message personnalisé</h3>
          <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.6;white-space:pre-wrap">${this.esc(params.customMessage)}</p>
        </div>
      `
          : ''
      }

      ${this.emailTemplates.alert({
        type: 'warning',
        message: '<strong>À traiter rapidement</strong> — Le client attend une réponse sous 48h maximum.',
      })}

      <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6">
        Pour répondre, contactez directement le client à l'adresse email ci-dessus.
      </p>
    `;

    await this.sendEmail(
      supportEmail,
      `[PLANORA 360] Demande de devis - ${planLabels[params.plan] || params.plan}`,
      this.emailTemplates.base({
        title: '📋 Demande de devis',
        preheader: `Nouvelle demande de ${this.esc(params.organizationName)} pour le plan ${planLabels[params.plan]}`,
        content: supportContent,
        showLogo: false,
      }),
    );

    // 2. Email de confirmation au client
    const clientContent = `
      <p style="margin:0 0 24px;color:#0f172a;font-size:16px">
        Bonjour <strong>${params.fullName.split(' ')[0]}</strong>,
      </p>

      <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
        Nous avons bien reçu votre demande de devis pour le plan <strong>${planLabels[params.plan] || params.plan}</strong> (facturation ${cycleLabel.toLowerCase()}).
      </p>

      ${this.emailTemplates.alert({
        type: 'info',
        message: 'Notre équipe commerciale vous contactera sous <strong>48 heures</strong> pour vous proposer une offre personnalisée adaptée à vos besoins.',
      })}

      ${this.emailTemplates.infoCard({
        title: 'Récapitulatif de votre demande',
        rows: [
          { label: 'Organisation', value: this.esc(params.organizationName) },
          { label: 'Plan', value: planLabels[params.plan] || params.plan },
          { label: 'Cycle', value: cycleLabel },
        ],
      })}

      <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6">
        En attendant, si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:contact@planora360.org" style="color:#2563eb;text-decoration:none">contact@planora360.org</a>
      </p>
    `;

    await this.sendEmail(
      params.email,
      '[PLANORA 360] Demande de devis reçue',
      this.emailTemplates.base({
        title: 'Demande bien reçue !',
        preheader: `Votre demande de devis pour le plan ${planLabels[params.plan]} a été envoyée`,
        content: clientContent,
        headerGradient: 'linear-gradient(135deg, #0b1629 0%, #1e3a5f 100%)',
        showLogo: true,
        footerNote: 'Vous avez reçu cet email car vous avez demandé un devis sur planora360.org',
      }),
    );
  }
}
