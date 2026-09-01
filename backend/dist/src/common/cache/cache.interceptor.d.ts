import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Observable } from 'rxjs';
export declare class HttpCacheInterceptor implements NestInterceptor {
    private cacheManager;
    constructor(cacheManager: Cache);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private buildCacheKey;
    private getTTL;
}
