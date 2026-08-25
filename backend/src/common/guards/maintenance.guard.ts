import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

/**
 * MaintenanceGuard - Bloque l'accès quand le mode maintenance est activé
 *
 * Bypass automatique pour :
 * - Endpoints /health et /api/auth
 * - Super administrateurs (permission "*")
 * - IPs whitelistées
 */
@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // 1. Toujours autoriser health check + auth endpoints
    if (url.match(/^\/(health|api\/auth)/)) {
      return true;
    }

    // 2. Toujours autoriser les routes admin et maintenance (protégées par JWT + RolesGuard)
    if (url.match(/^\/api\/(super-admin|admin|maintenance)/)) {
      return true;
    }

    // 3. Récupérer les settings (cache possible ici pour optimisation)
    const settings = await this.prisma.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    // Pas de settings ou mode maintenance désactivé → autoriser
    if (!settings || !settings.maintenanceMode) {
      return true;
    }

    // 4. Check si l'utilisateur est super admin
    const user = request.user;
    if (user?.role?.permissions?.includes('*')) {
      return true; // Super admin bypass
    }

    // 5. Check IP whitelist
    const clientIP = this.getClientIP(request);
    if (settings.allowedIPs?.includes(clientIP)) {
      return true;
    }

    // 6. Check user whitelist
    if (user?.id && settings.allowedUserIds?.includes(user.id)) {
      return true;
    }

    // 7. Bloquer l'accès
    throw new ServiceUnavailableException({
      statusCode: 503,
      message:
        settings.maintenanceMessage ||
        'Le système est actuellement en maintenance. Veuillez réessayer dans quelques instants.',
      estimatedEnd: settings.scheduledEnd,
    });
  }

  private getClientIP(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      ''
    );
  }
}
