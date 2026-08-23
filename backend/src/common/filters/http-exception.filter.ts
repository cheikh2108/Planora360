import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
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

    // Log l'erreur complète pour le debugging (avec stack trace)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );

      // Capture dans Sentry (erreurs serveur uniquement)
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
}
