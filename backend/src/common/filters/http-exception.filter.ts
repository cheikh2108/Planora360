import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Une erreur interne est survenue';

    // Ignorer les erreurs attendues pour Sentry
    const shouldIgnoreForSentry = this.shouldIgnoreForSentry(exception, status);

    // Log l'erreur complète pour le debugging (avec stack trace)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );

      // Capture dans Sentry (erreurs serveur uniquement, sauf celles ignorées)
      if (!shouldIgnoreForSentry) {
        Sentry.withScope((scope) => {
        // Ajouter contexte de la requête
        scope.setContext('http', {
          method: request.method,
          url: request.url,
          query: request.query,
          statusCode: status,
        });

        // Ajouter user si disponible (JWT décodé par passport)
        if (request.user) {
          scope.setUser({
            id: (request.user as any).sub || (request.user as any).id,
            email: (request.user as any).email,
          });
        }

        // Ajouter organization context si disponible
        if ((request as any).organizationId) {
          scope.setTag('organizationId', (request as any).organizationId);
        }

          // Capturer l'exception
          if (exception instanceof Error) {
            Sentry.captureException(exception);
          } else {
            Sentry.captureMessage(`Unhandled error: ${JSON.stringify(exception)}`, 'error');
          }
        });
      }
    }

    // En production, ne jamais exposer les stack traces
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || message,
      // Inclure stack SEULEMENT en développement
      ...(process.env.NODE_ENV !== 'production' && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Détermine si une erreur doit être ignorée par Sentry
   * (erreurs attendues dans le fonctionnement normal)
   */
  private shouldIgnoreForSentry(exception: unknown, status: number): boolean {
    // Ignorer les erreurs 503 du mode maintenance
    if (status === HttpStatus.SERVICE_UNAVAILABLE) {
      if (exception instanceof ServiceUnavailableException) {
        const response = exception.getResponse();
        // Vérifier si c'est bien une erreur de maintenance (contient "maintenance" dans le message)
        if (typeof response === 'object' && 'message' in response) {
          const message = (response as any).message;
          if (typeof message === 'string' && message.toLowerCase().includes('maintenance')) {
            return true; // Ignorer pour Sentry
          }
        }
      }
    }

    return false; // Par défaut, envoyer à Sentry
  }
}
