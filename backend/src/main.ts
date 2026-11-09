// Sentry must be imported FIRST, before any other module
import './instrument';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  // rawBody : nécessaire pour vérifier la signature HMAC du webhook DexPay
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  configureApp(app);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application running on: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
