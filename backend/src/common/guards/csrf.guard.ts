import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CsrfService } from '../csrf/csrf.service';

/**
 * CSRF Guard - Protège contre les attaques CSRF
 * Vérifie que le token CSRF dans le header correspond au token dans le cookie
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // CSRF protection uniquement pour les requêtes mutantes
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    // Ignorer CSRF pour routes publiques (pas encore de cookie)
    const path: string = request.path ?? request.url.split('?')[0];
    if (/^\/(api\/)?auth\/(login|register|refresh|request-quote|forgot-password|reset-password|reset-password\/check)$/.test(path)) {
      return true;
    }
    // Webhook DexPay : appel serveur à serveur, authentifié par signature HMAC (voir DexpayController)
    if (/^\/(api\/)?dexpay\/webhook$/.test(path)) {
      return true;
    }

    // Récupérer le token CSRF du cookie
    const csrfCookie = request.cookies?.['csrf-token'];

    // Récupérer le token CSRF du header
    const csrfHeader = request.headers['x-csrf-token'];

    // Les deux doivent être présents et identiques
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    // Valider le token
    if (!this.csrfService.validateToken(csrfCookie)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
