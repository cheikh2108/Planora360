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
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const cache_invalidation_service_1 = require("./cache-invalidation.service");
let CacheModule = class CacheModule {
};
exports.CacheModule = CacheModule;
exports.CacheModule = CacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                useFactory: async () => {
                    const redisUrl = process.env.REDIS_URL;
                    if (!redisUrl) {
                        console.warn('⚠️  REDIS_URL not configured. Using in-memory cache (not recommended for production)');
                        return {
                            ttl: 300,
                            max: 100,
                        };
                    }
                    try {
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            url: redisUrl,
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
                            store: store,
                            ttl: 300,
                            max: 1000,
                        };
                    }
                    catch (error) {
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
        providers: [cache_invalidation_service_1.CacheInvalidationService],
        exports: [cache_manager_1.CacheModule, cache_invalidation_service_1.CacheInvalidationService],
    })
], CacheModule);
//# sourceMappingURL=cache.module.js.map