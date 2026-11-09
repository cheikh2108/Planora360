import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { isSuperAdmin } from '../../../common/guards/roles.guard';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ERROR_MESSAGES } from '../constants/error-messages';

/**
 * Guard critique : Empêche l'accès aux soumissions avant la date d'ouverture des offres
 *
 * Ce guard implémente une règle de sécurité fondamentale dans les marchés publics :
 * la confidentialité absolue des soumissions jusqu'à la date d'ouverture officielle.
 *
 * @remarks
 * - Exception unique : Super Admin (pour audit et conformité)
 * - Basé sur procedure.dateOuverture
 * - Retourne une erreur explicite avec la date/heure d'ouverture
 *
 * @example
 * ```typescript
 * @UseGuards(SoumissionConfidentialityGuard)
 * @Get(':procedureId/soumissions')
 * getSoumissions(@Param('procedureId') id: string) {}
 * ```
 */
@Injectable()
export class SoumissionConfidentialityGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin a toujours accès (pour audit)
    if (isSuperAdmin(user)) {
      return true;
    }

    // Extraire l'ID de la procédure depuis les params
    const procedureId = request.params.procedureId || request.body?.procedureId;

    if (!procedureId) {
      throw new ForbiddenException('Procédure non spécifiée');
    }

    // Récupérer la procédure et vérifier la date d'ouverture
    const procedure = await this.prisma.procedure.findUnique({
      where: { id: procedureId },
      select: {
        id: true,
        dateOuverture: true,
        status: true,
      },
    });

    if (!procedure) {
      throw new ForbiddenException(ERROR_MESSAGES.PROCEDURE.NOT_FOUND);
    }

    if (!procedure.dateOuverture) {
      throw new ForbiddenException(ERROR_MESSAGES.PROCEDURE.NO_OPENING_DATE);
    }

    const now = new Date();
    const dateOuverture = new Date(procedure.dateOuverture);

    // Accès interdit avant la date d'ouverture
    if (now < dateOuverture) {
      throw new ForbiddenException(
        ERROR_MESSAGES.SOUMISSION.CONFIDENTIALITY_BREACH(dateOuverture)
      );
    }

    return true;
  }
}
