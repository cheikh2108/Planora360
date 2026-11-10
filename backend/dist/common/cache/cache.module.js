"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cache_manager_1 = require("@nestjs/cache-manager");
const redis_1 = require("@keyv/redis");
const cache_invalidation_service_1 = require("./cache-invalidation.service");
const cache_version_interceptor_1 = require("./cache-version.interceptor");
const DEFAULT_TTL_MS = 5 * 60 * 1000;
let CacheModule = class CacheModule {
};
exports.CacheModule = CacheModule;
exports.CacheModule = CacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                useFactory: async () => {
                    const logger = new common_1.Logger('CacheModule');
                    const redisUrl = process.env.REDIS_URL;
                    if (!redisUrl) {
                        logger.warn('REDIS_URL non défini : cache en mémoire (déconseillé avec plusieurs instances)');
                        return { ttl: DEFAULT_TTL_MS };
                    }
                    const keyv = (0, redis_1.createKeyv)(redisUrl, { namespace: 'planora' });
                    keyv.on('error', (error) => logger.error(`Redis : ${error?.message ?? error}`));
                    logger.log('Cache Redis configuré');
                    return { stores: [keyv], ttl: DEFAULT_TTL_MS };
                },
            }),
        ],
        providers: [cache_invalidation_service_1.CacheInvalidationService, { provide: core_1.APP_INTERCEPTOR, useClass: cache_version_interceptor_1.CacheVersionInterceptor }],
        exports: [cache_manager_1.CacheModule, cache_invalidation_service_1.CacheInvalidationService],
    })
], CacheModule);
//# sourceMappingURL=cache.module.js.map