import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Observable } from 'rxjs';
import { CacheInvalidationService } from './cache-invalidation.service';
export declare class HttpCacheInterceptor implements NestInterceptor {
    private cacheManager;
    private readonly cacheInvalidation;
    constructor(cacheManager: Cache, cacheInvalidation: CacheInvalidationService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private buildCacheKey;
    private getTTL;
}
