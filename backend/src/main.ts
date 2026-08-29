// Sentry must be imported FIRST, before any other module
import './instrument';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cookie parser pour lire les cookies httpOnly
  app.use(cookieParser());

  // Servir les fichiers statiques uploadés
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
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
    .map(o => o.trim());
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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
