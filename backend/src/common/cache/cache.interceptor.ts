import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheInvalidationService } from './cache-invalidation.service';

/**
 * Intercepteur de cache intelligent
 * Usage: @UseInterceptors(CacheInterceptor)
 *
 * Stratégie:
 * - Cache basé sur: organizationId + version du cache de l'organisation + userId + URL + query params
 * - La version change après chaque mutation de l'organisation (CacheVersionInterceptor)
 * - Ignore les mutations (POST, PUT, PATCH, DELETE)
 * - TTL configurable par endpoint
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Ne pas cacher les mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Construire la clé de cache
    const orgId = request.user?.organizationId;
    // Sans organisation (super admin, anonyme), pas de cache : rien ne pourrait l'invalider
    if (!orgId) return next.handle();
    const version = await this.cacheInvalidation.getVersion(orgId);
    const cacheKey = this.buildCacheKey(request, version);

    // Vérifier le cache
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse !== undefined && cachedResponse !== null) {
      return of(cachedResponse);
    }

    // Exécuter la requête et la mettre en cache
    return next.handle().pipe(
      tap(async (response) => {
        // TTL par défaut: 5 minutes
        const ttl = this.getTTL(request.url);
        await this.cacheManager.set(cacheKey, response, ttl * 1000);
      }),
    );
  }

  /**
   * Construit une clé de cache unique basée sur:
   * - L'utilisateur (userId)
   * - L'organisation (organizationId) et sa version de cache
   * - L'URL
   * - Les query params
   */
  private buildCacheKey(request: any, version: string): string {
    const userId = request.user?.id || 'anonymous';
    const orgId = request.user?.organizationId;
    const url = request.url.split('?')[0]; // URL sans query params
    const queryParams = JSON.stringify(request.query || {});

    return `cache:${orgId}:v${version}:${userId}:${url}:${queryParams}`;
  }

  /**
   * Détermine le TTL (Time To Live) en secondes selon l'endpoint
   */
  private getTTL(url: string): number {
    // Permissions & rôles: 10 minutes (changent rarement)
    if (url.includes('/roles') || url.includes('/permissions')) {
      return 600;
    }

    // Dashboard stats: 2 minutes (calculs lourds, tolère un léger décalage)
    if (url.includes('/dashboards/overview') || url.includes('/dashboards/performance')) {
      return 120;
    }

    // Liste utilisateurs: 5 minutes
    if (url.includes('/users/list-for-assignment')) {
      return 300;
    }

    // Organizations settings: 10 minutes
    if (url.includes('/organizations') && url.match(/\/organizations\/[a-z0-9-]+$/)) {
      return 600;
    }

    // Budget summary: 3 minutes
    if (url.includes('/budgets/summary')) {
      return 180;
    }

    // Par défaut: 5 minutes
    return 300;
  }
}
