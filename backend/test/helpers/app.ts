import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { PrismaService } from '../../src/common/prisma/prisma.service';

export interface TestContext {
  app: NestExpressApplication;
  prisma: PrismaService;
  http: any;
}

/** Stockage de rate limiting qui ne bloque jamais (les tests de throttling utilisent realThrottler). */
const noThrottleStorage = {
  increment: async () => ({
    totalHits: 1,
    timeToExpire: 60,
    isBlocked: false,
    timeToBlockExpire: 0,
  }),
};

/**
 * Démarre l'application complète (AppModule + même configuration HTTP que main.ts).
 * @param realThrottler garder le vrai rate limiting (pour tester les limites de login, etc.)
 */
export async function createTestApp(
  opts: { realThrottler?: boolean } = {},
): Promise<TestContext> {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (!opts.realThrottler) {
    builder = builder
      .overrideProvider(ThrottlerStorage)
      .useValue(noThrottleStorage);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({
    logger: ['error'],
    rawBody: true,
  });
  configureApp(app);
  await app.init();
  return { app, prisma: app.get(PrismaService), http: app.getHttpServer() };
}

export async function closeTestApp(ctx?: { app: INestApplication }) {
  if (ctx?.app) await ctx.app.close();
}

/** Liste toutes les routes HTTP enregistrées (méthode + chemin), lue dans le routeur Express. */
export function listRoutes(
  app: NestExpressApplication,
): { method: string; path: string }[] {
  const instance: any = app.getHttpAdapter().getInstance();
  const stack: any[] = instance.router?.stack ?? instance._router?.stack ?? [];
  const routes: { method: string; path: string }[] = [];
  for (const layer of stack) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      routes.push({ method: method.toUpperCase(), path: layer.route.path });
    }
  }
  return routes;
}
