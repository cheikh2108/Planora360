"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/prisma/prisma.service");
const resend_1 = require("resend");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    resend = null;
    constructor(prisma, config) {
        this.prisma = prisma;
        const apiKey = config.get('RESEND_API_KEY');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
        }
        else {
            this.logger.warn('RESEND_API_KEY non configuré — emails désactivés');
        }
    }
    async sendEmail(to, subject, html) {
        if (!this.resend) {
            this.logger.log(`[EMAIL] À: ${to} | Sujet: ${subject}`);
            return;
        }
        try {
            await this.resend.emails.send({
                from: 'PLANORA 360 <noreply@ataabaentreprise.org>',
                to,
                subject,
                html,
            });
        }
        catch (err) {
            this.logger.error(`Erreur envoi email à ${to}: ${err}`);
        }
    }
    async sendWelcomeCredentials(params) {
        if (!this.resend) {
            this.logger.log(`\n┌─ CREDENTIALS ──────────────────────────┐\n│ Org      : ${params.orgName}\n│ Email    : ${params.email}\n│ Password : ${params.tempPassword}\n└────────────────────────────────────────┘`);
        }
        await this.sendEmail(params.email, `[PLANORA 360] Votre accès à ${params.orgName}`, `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="background:#0b1629;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
          <span style="color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px">PLANORA 360</span>
        </div>
        <p style="color:#0f172a;font-size:16px">Bonjour <strong>${params.firstName}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.6">
          Un compte a été créé pour vous sur <strong>PLANORA 360</strong> dans l'organisation <strong>${params.orgName}</strong>.
          Voici vos identifiants de connexion :
        </p>
        <div style="background:#f1f5f9;border-radius:10px;padding:20px 24px;margin:24px 0">
          <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Adresse e-mail</p>
          <p style="margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:600">${params.email}</p>
          <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Mot de passe temporaire</p>
          <p style="margin:0;color:#2563eb;font-size:18px;font-weight:800;letter-spacing:0.08em;font-family:monospace">${params.tempPassword}</p>
        </div>
        <p style="color:#ef4444;font-size:13px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px">
          Vous serez invité à choisir un nouveau mot de passe lors de votre première connexion.
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px">© 2025 PLANORA 360 — Ne pas répondre à cet email.</p>
      </div>`);
    }
    async notifyValidationPending(params) {
        const validator = await this.prisma.user.findUnique({
            where: { id: params.validatorId },
            select: { email: true, firstName: true },
        });
        if (!validator)
            return;
        await this.sendEmail(validator.email, `[PLANORA 360] Validation requise — ${params.activityTitle}`, `<p>Bonjour ${validator.firstName},</p>
       <p>L'activité <strong>${params.activityTitle}</strong> est en attente de votre validation (étape : ${params.step}).</p>
       <p>Connectez-vous sur PLANORA 360 pour traiter cette demande.</p>`);
    }
    async notifyValidationResult(params) {
        const responsible = await this.prisma.user.findUnique({
            where: { id: params.responsibleId },
            select: { email: true, firstName: true },
        });
        if (!responsible)
            return;
        const label = params.decision === 'APPROUVE' ? '✅ Approuvée' : '❌ Rejetée';
        await this.sendEmail(responsible.email, `[PLANORA 360] Activité ${label} — ${params.activityTitle}`, `<p>Bonjour ${responsible.firstName},</p>
       <p>L'activité <strong>${params.activityTitle}</strong> a été <strong>${label}</strong> à l'étape ${params.step}.</p>
       ${params.comment ? `<p>Commentaire : ${params.comment}</p>` : ''}`);
    }
    async notifyOverdueActivities(organizationId) {
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
            await this.sendEmail(activity.responsible.email, `[PLANORA 360] Activité en retard — ${activity.title}`, `<p>Bonjour ${activity.responsible.firstName},</p>
         <p>L'activité <strong>${activity.title}</strong> est en retard (échéance : ${activity.dueDate.toLocaleDateString('fr-FR')}).</p>`);
        }
        this.logger.log(`Alertes retard : ${overdue.length} activité(s) notifiée(s)`);
    }
    async notifyUpcomingDeadlines(organizationId, daysAhead = 3) {
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
            await this.sendEmail(activity.responsible.email, `[PLANORA 360] Échéance proche — ${activity.title}`, `<p>Bonjour ${activity.responsible.firstName},</p>
         <p>L'activité <strong>${activity.title}</strong> arrive à échéance le ${activity.dueDate.toLocaleDateString('fr-FR')}.</p>`);
        }
        this.logger.log(`Alertes échéance : ${upcoming.length} activité(s) notifiée(s)`);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map