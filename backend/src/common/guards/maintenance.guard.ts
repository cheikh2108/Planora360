import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // 1. Toujours autoriser health check + auth endpoints
    if (url.match(/^\/(health|api\/auth)/)) {
      return true;
    }

    // 2. Vérifier si l'utilisateur est super admin via le token JWT
    // (car request.user n'est pas encore peuplé à ce stade)
    const token = this.extractTokenFromHeader(request);
    if (token && await this.isSuperAdmin(token)) {
      return true; // Super admin bypass complet
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

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  private async isSuperAdmin(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      // Récupérer l'utilisateur avec son rôle
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      // Vérifier si le rôle a la permission "*" (super admin)
      const permissions = user?.role?.permissions as string[] | null;
      return permissions?.includes('*') ?? false;
    } catch {
      return false;
    }
  }
}
