import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';

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

    // Super Admin avec permission wildcard "*" a accès à tout
    const userPermissions: string[] = user.role?.permissions ?? [];
    if (userPermissions.includes('*')) return true;

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.includes(user.role?.name);
      if (!hasRole) {
        throw new ForbiddenException(
          `Cette action est réservée aux rôles suivants : ${requiredRoles.join(', ')}. ` +
          `Contactez votre administrateur pour obtenir les autorisations nécessaires.`
        );
      }
    }

    if (requiredPermissions?.length) {
      const hasAll = requiredPermissions.every((p) =>
        userPermissions.includes(p),
      );
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
