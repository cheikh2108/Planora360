import { Module, Global, Logger } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { CacheInvalidationService } from './cache-invalidation.service';
import { CacheVersionInterceptor } from './cache-version.interceptor';

/** TTL par défaut des entrées (cache-manager 7 : millisecondes). */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => {
        const logger = new Logger('CacheModule');
        const redisUrl = process.env.REDIS_URL;

        // Sans Redis : cache mémoire du processus (dev, instance unique)
        if (!redisUrl) {
          logger.warn('REDIS_URL non défini : cache en mémoire (déconseillé avec plusieurs instances)');
          return { ttl: DEFAULT_TTL_MS };
        }

        // cache-manager 7 attend des stores Keyv (`stores`) : l'ancienne option `store`
        // (cache-manager-redis-yet) était ignorée et le cache restait en mémoire.
        const keyv = createKeyv(redisUrl, { namespace: 'planora' });
        keyv.on('error', (error) => logger.error(`Redis : ${error?.message ?? error}`));
        logger.log('Cache Redis configuré');
        return { stores: [keyv], ttl: DEFAULT_TTL_MS };
      },
    }),
  ],
  providers: [CacheInvalidationService, { provide: APP_INTERCEPTOR, useClass: CacheVersionInterceptor }],
  exports: [NestCacheModule, CacheInvalidationService],
})
export class CacheModule {}
