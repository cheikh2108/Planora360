"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const cache_invalidation_service_1 = require("./cache-invalidation.service");
let HttpCacheInterceptor = class HttpCacheInterceptor {
    cacheManager;
    cacheInvalidation;
    constructor(cacheManager, cacheInvalidation) {
        this.cacheManager = cacheManager;
        this.cacheInvalidation = cacheInvalidation;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const orgId = request.user?.organizationId;
        if (!orgId)
            return next.handle();
        const version = await this.cacheInvalidation.getVersion(orgId);
        const cacheKey = this.buildCacheKey(request, version);
        const cachedResponse = await this.cacheManager.get(cacheKey);
        if (cachedResponse !== undefined && cachedResponse !== null) {
            return (0, rxjs_1.of)(cachedResponse);
        }
        return next.handle().pipe((0, operators_1.tap)(async (response) => {
            const ttl = this.getTTL(request.url);
            await this.cacheManager.set(cacheKey, response, ttl * 1000);
        }));
    }
    buildCacheKey(request, version) {
        const userId = request.user?.id || 'anonymous';
        const orgId = request.user?.organizationId;
        const url = request.url.split('?')[0];
        const queryParams = JSON.stringify(request.query || {});
        return `cache:${orgId}:v${version}:${userId}:${url}:${queryParams}`;
    }
    getTTL(url) {
        if (url.includes('/roles') || url.includes('/permissions')) {
            return 600;
        }
        if (url.includes('/dashboards/overview') || url.includes('/dashboards/performance')) {
            return 120;
        }
        if (url.includes('/users/list-for-assignment')) {
            return 300;
        }
        if (url.includes('/organizations') && url.match(/\/organizations\/[a-z0-9-]+$/)) {
            return 600;
        }
        if (url.includes('/budgets/summary')) {
            return 180;
        }
        return 300;
    }
};
exports.HttpCacheInterceptor = HttpCacheInterceptor;
exports.HttpCacheInterceptor = HttpCacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, cache_invalidation_service_1.CacheInvalidationService])
], HttpCacheInterceptor);
//# sourceMappingURL=cache.interceptor.js.map