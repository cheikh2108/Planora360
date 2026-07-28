import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Notifie le responsable d'une activité et le validateur de l'étape suivante.
   * En Phase 4 : log console. En Phase 8, brancher l'envoi email via Resend.
   */
  async notifyValidationPending(params: {
    activityId: string;
    activityTitle: string;
    step: string;
    validatorId: string;
    organizationId: string;
  }) {
    const validator = await this.prisma.user.findUnique({
      where: { id: params.validatorId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (validator) {
      this.logger.log(
        `[NOTIFICATION] Validation en attente — étape: ${params.step} | activité: "${params.activityTitle}" | validateur: ${validator.email}`,
      );
      // TODO Phase 8 : envoyer email via Resend
    }
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

    if (responsible) {
      this.logger.log(
        `[NOTIFICATION] Décision: ${params.decision} — étape: ${params.step} | activité: "${params.activityTitle}" | responsable: ${responsible.email}`,
      );
      // TODO Phase 8 : envoyer email via Resend
    }
  }
}
