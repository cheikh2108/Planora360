import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Guard critique : Empêche l'accès aux soumissions avant la date d'ouverture des offres
 * Exception : Super Admin uniquement (pour audit)
 */
@Injectable()
export class SoumissionConfidentialityGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin a toujours accès (pour audit)
    if (user.role?.name === 'Super Admin') {
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
        dateOuvertureOffres: true,
        status: true,
      },
    });

    if (!procedure) {
      throw new ForbiddenException('Procédure introuvable');
    }

    const now = new Date();
    const dateOuverture = new Date(procedure.dateOuvertureOffres);

    // Accès interdit avant la date d'ouverture
    if (now < dateOuverture) {
      throw new ForbiddenException(
        `Accès aux soumissions interdit avant le ${dateOuverture.toLocaleDateString('fr-FR')} à ${dateOuverture.toLocaleTimeString('fr-FR')}. ` +
          `Cette mesure garantit la confidentialité et l'intégrité du processus de passation de marchés.`,
      );
    }

    return true;
  }
}
