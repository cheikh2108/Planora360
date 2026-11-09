import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { ROLE_SUPER_ADMIN } from '../constants/auth.constants';
import { WILDCARD_PERMISSION } from '../constants/permissions.constants';

/**
 * Vrai uniquement pour le rôle SYSTÈME Super administrateur (organizationId null).
 * Un rôle personnalisé ne peut jamais obtenir ce statut, quel que soit son nom ou ses permissions.
 */
export function isSuperAdmin(user: any): boolean {
  const role = user?.role;
  return (
    !!role &&
    role.organizationId === null &&
    role.name === ROLE_SUPER_ADMIN &&
    Array.isArray(role.permissions) &&
    role.permissions.includes(WILDCARD_PERMISSION)
  );
}

/**
 * Nom de rôle à utiliser pour les règles métier : le nom n'est fiable que pour un rôle système.
 * Pour un rôle personnalisé on renvoie null (seules ses permissions comptent).
 */
export function systemRoleName(user: any): string | null {
  if (isSuperAdmin(user)) return ROLE_SUPER_ADMIN;
  return user?.role?.organizationId === null ? (user.role.name as string) : null;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Accès refusé. Veuillez vous reconnecter.');

    if (isSuperAdmin(user)) return true;

    const userPermissions: string[] = Array.isArray(user.role?.permissions) ? user.role.permissions : [];

    if (requiredRoles?.length) {
      // Les contrôles par nom ne valent que pour les rôles système :
      // un rôle personnalisé nommé "Administrateur" n'hérite pas des droits du rôle système.
      const isSystemRole = user.role?.organizationId === null;
      const hasRole = isSystemRole && requiredRoles.includes(user.role?.name);
      if (!hasRole) {
        throw new ForbiddenException(
          `Cette action est réservée aux rôles suivants : ${requiredRoles.join(', ')}. ` +
          `Contactez votre administrateur pour obtenir les autorisations nécessaires.`
        );
      }
    }

    if (requiredPermissions?.length) {
      const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));
      if (!hasAll) {
        throw new ForbiddenException(
          'Vous n\'avez pas les autorisations nécessaires pour effectuer cette action. ' +
          'Contactez votre administrateur pour obtenir les permissions requises.'
        );
      }
    }

    return true;
  }
}
