import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CacheInvalidationService } from './cache-invalidation.service';
export declare class CacheVersionInterceptor implements NestInterceptor {
    private readonly cacheInvalidation;
    constructor(cacheInvalidation: CacheInvalidationService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
