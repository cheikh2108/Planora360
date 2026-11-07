import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser = require('cookie-parser');
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Configuration HTTP commune à main.ts et aux tests e2e,
 * pour que les tests tournent exactement avec la même config que la prod.
 */
export function configureApp(
  app: NestExpressApplication,
  opts: { uploadsDir?: string } = {},
): NestExpressApplication {
  // Cookie parser pour lire les cookies httpOnly
  app.use(cookieParser());

  // Servir les fichiers statiques uploadés (dist/src -> remonter de 2 niveaux)
  app.useStaticAssets(opts.uploadsDir ?? join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

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

  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });

  return app;
}
