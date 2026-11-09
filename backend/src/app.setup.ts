import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser = require('cookie-parser');
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Configuration HTTP commune à main.ts et aux tests e2e,
 * pour que les tests tournent exactement avec la même config que la prod.
 *
 * L'application doit être créée avec `{ rawBody: true }` (signature du webhook DexPay).
 * Les fichiers téléversés ne sont plus servis en statique : ils passent par
 * GET /api/documents/:id/download et GET /api/files/* (authentifiés, filtrés par organisation).
 */
export function configureApp(
  app: NestExpressApplication,
): NestExpressApplication {
  // En-têtes de sécurité (nosniff, frameguard, HSTS, etc.). L'API ne sert pas de HTML : CSP stricte.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  // Cookie parser pour lire les cookies httpOnly
  app.use(cookieParser());

  // Derrière un proxy (Hostinger, Nginx) : IP réelle pour le rate limiting et les journaux
  app.set('trust proxy', 1);

  app.setGlobalPrefix('api');

  // Filtre d'exceptions global (masque stack traces en production)
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Les cookies de session imposent une liste explicite d'origines : "*" est ignoré.
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o && o !== '*');
  if ((process.env.FRONTEND_URL ?? '').includes('*')) {
    new Logger('CORS').warn(
      'FRONTEND_URL contient "*" : ignoré (incompatible avec les cookies de session).',
    );
  }
  app.enableCors({
    origin: (origin, cb) => {
      // Requêtes sans Origin (serveur à serveur, curl) : autorisées, elles ne portent pas de cookies tiers
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
  });

  return app;
}
