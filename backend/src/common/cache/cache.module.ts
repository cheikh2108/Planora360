import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';
import { CacheInvalidationService } from './cache-invalidation.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync<RedisClientOptions>({
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL;

        // Si pas de Redis configuré, utiliser le cache mémoire (dev)
        if (!redisUrl) {
          console.warn('⚠️  REDIS_URL not configured. Using in-memory cache (not recommended for production)');
          return {
            ttl: 300, // 5 minutes par défaut
            max: 100, // Max 100 entrées en mémoire
          };
        }

        try {
          const store = await redisStore({
            url: redisUrl,
            // Options de connexion
            socket: {
              connectTimeout: 5000,
              reconnectStrategy: (retries) => {
                if (retries > 3) {
                  console.error('❌ Redis connection failed after 3 retries');
                  return new Error('Redis unavailable');
                }
                return Math.min(retries * 100, 3000);
              },
            },
          });

          console.log('✅ Redis cache connected');

          return {
            store: store as any,
            ttl: 300, // 5 minutes par défaut
            max: 1000, // Max 1000 entrées
          };
        } catch (error) {
          console.error('❌ Redis connection error:', error.message);
          console.warn('⚠️  Falling back to in-memory cache');
          return {
            ttl: 300,
            max: 100,
          };
        }
      },
    }),
  ],
  providers: [CacheInvalidationService],
  exports: [NestCacheModule, CacheInvalidationService],
})
export class CacheModule {}
