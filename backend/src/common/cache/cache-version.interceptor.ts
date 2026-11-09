import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheInvalidationService } from './cache-invalidation.service';

const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Intercepteur global : après toute mutation réussie d'un utilisateur authentifié, change la
 * version du cache de son organisation. Les tableaux de bord et listes en cache reflètent ainsi
 * immédiatement les créations, modifications et suppressions, quel que soit le module.
 */
@Injectable()
export class CacheVersionInterceptor implements NestInterceptor {
  constructor(private readonly cacheInvalidation: CacheInvalidationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();
    const request = context.switchToHttp().getRequest();
    if (!MUTATIONS.has(request.method)) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const organizationId = request.user?.organizationId;
        if (organizationId) void this.cacheInvalidation.invalidateAll(organizationId);
      }),
    );
  }
}
