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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheVersionInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const cache_invalidation_service_1 = require("./cache-invalidation.service");
const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let CacheVersionInterceptor = class CacheVersionInterceptor {
    cacheInvalidation;
    constructor(cacheInvalidation) {
        this.cacheInvalidation = cacheInvalidation;
    }
    intercept(context, next) {
        if (context.getType() !== 'http')
            return next.handle();
        const request = context.switchToHttp().getRequest();
        if (!MUTATIONS.has(request.method))
            return next.handle();
        return next.handle().pipe((0, operators_1.tap)(() => {
            const organizationId = request.user?.organizationId;
            if (organizationId)
                void this.cacheInvalidation.invalidateAll(organizationId);
        }));
    }
};
exports.CacheVersionInterceptor = CacheVersionInterceptor;
exports.CacheVersionInterceptor = CacheVersionInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_invalidation_service_1.CacheInvalidationService])
], CacheVersionInterceptor);
//# sourceMappingURL=cache-version.interceptor.js.map