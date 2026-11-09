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
var CacheInvalidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInvalidationService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const VERSION_TTL_MS = 7 * 24 * 3600 * 1000;
let CacheInvalidationService = CacheInvalidationService_1 = class CacheInvalidationService {
    cacheManager;
    logger = new common_1.Logger(CacheInvalidationService_1.name);
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    versionKey(organizationId) {
        return `cache-version:${organizationId}`;
    }
    async getVersion(organizationId) {
        try {
            const version = await this.cacheManager.get(this.versionKey(organizationId));
            return version ?? '0';
        }
        catch {
            return '0';
        }
    }
    async invalidateAll(organizationId) {
        if (!organizationId)
            return;
        try {
            const version = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
            await this.cacheManager.set(this.versionKey(organizationId), version, VERSION_TTL_MS);
        }
        catch (error) {
            this.logger.error(`Invalidation du cache impossible : ${error.message}`);
        }
    }
    invalidateDashboard(organizationId) {
        return this.invalidateAll(organizationId);
    }
    invalidateUsers(organizationId) {
        return this.invalidateAll(organizationId);
    }
    invalidateRoles(organizationId) {
        return this.invalidateAll(organizationId);
    }
    invalidateOrganization(organizationId) {
        return this.invalidateAll(organizationId);
    }
    invalidatePlans(organizationId) {
        return this.invalidateAll(organizationId);
    }
    invalidateActivities(organizationId) {
        return this.invalidateAll(organizationId);
    }
};
exports.CacheInvalidationService = CacheInvalidationService;
exports.CacheInvalidationService = CacheInvalidationService = CacheInvalidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], CacheInvalidationService);
//# sourceMappingURL=cache-invalidation.service.js.map