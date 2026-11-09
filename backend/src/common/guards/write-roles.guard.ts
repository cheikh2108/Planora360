import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isSuperAdmin, systemRoleName } from './roles.guard';

const WRITE_ROLES_KEY = 'writeRoles';

interface WriteRolesOptions {
  /** Rôles système autorisés à créer / modifier / supprimer. */
  roles: string[];
  /** Pour un rôle personnalisé : permission qui ouvre l'écriture (ex. 'plan.update'). */
  permission?: string;
}

/**
 * Lecture ouverte à tout membre authentifié de l'organisation ;
 * écriture (POST, PUT, PATCH, DELETE) réservée aux rôles listés.
 * Un @Roles(...) posé sur une route reste appliqué en plus (règle plus stricte).
 * À placer AU-DESSUS de @UseGuards(JwtAuthGuard, ...) pour s'exécuter après l'authentification.
 */
export function WriteRoles(options: WriteRolesOptions) {
  return applyDecorators(SetMetadata(WRITE_ROLES_KEY, options), UseGuards(WriteRolesGuard));
}

@Injectable()
export class WriteRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<WriteRolesOptions>(WRITE_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return true;

    const user = request.user;
    if (!user) throw new ForbiddenException('Accès refusé. Veuillez vous reconnecter.');
    if (isSuperAdmin(user)) return true;

    const roleName = systemRoleName(user);
    if (roleName && options.roles.includes(roleName)) return true;

    const permissions: string[] = Array.isArray(user.role?.permissions) ? user.role.permissions : [];
    if (!roleName && options.permission && permissions.includes(options.permission)) return true;

    throw new ForbiddenException(
      `Cette action est réservée aux rôles suivants : ${options.roles.join(', ')}. ` +
        'Contactez votre administrateur pour obtenir les autorisations nécessaires.',
    );
  }
}

/** Listes de rôles par module. */
export const PASSATION_WRITERS = ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', 'Responsable financier'];
export const PLANNING_WRITERS = ['Administrateur', 'Coordinateur', 'Responsable de projet'];
export const ZONE_WRITERS = ['Administrateur', 'Coordinateur'];
export const FIELD_WRITERS = ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité"];
