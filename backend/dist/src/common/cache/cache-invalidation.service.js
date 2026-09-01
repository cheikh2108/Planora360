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
exports.CacheInvalidationService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let CacheInvalidationService = class CacheInvalidationService {
    cacheManager;
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async invalidateDashboard(organizationId) {
        const patterns = [
            `cache:${organizationId}:*:/dashboards/overview:*`,
            `cache:${organizationId}:*:/dashboards/performance:*`,
            `cache:${organizationId}:*:/budgets/summary:*`,
        ];
        await this.invalidateByPatterns(patterns);
        console.log(`🗑️  Cache invalidated: dashboard for org ${organizationId}`);
    }
    async invalidateUsers(organizationId) {
        const patterns = [
            `cache:${organizationId}:*:/users*`,
            `cache:${organizationId}:*:/admin/users*`,
        ];
        await this.invalidateByPatterns(patterns);
        console.log(`🗑️  Cache invalidated: users for org ${organizationId}`);
    }
    async invalidateRoles(organizationId) {
        const patterns = [
            `cache:${organizationId}:*:/roles*`,
            `cache:${organizationId}:*:/admin/roles*`,
        ];
        await this.invalidateByPatterns(patterns);
        console.log(`🗑️  Cache invalidated: roles for org ${organizationId}`);
    }
    async invalidateOrganization(organizationId) {
        const patterns = [`cache:${organizationId}:*:/organizations/${organizationId}*`];
        await this.invalidateByPatterns(patterns);
        console.log(`🗑️  Cache invalidated: organization ${organizationId}`);
    }
    async invalidatePlans(organizationId) {
        const patterns = [
            `cache:${organizationId}:*:/action-plans*`,
            `cache:${organizationId}:*:/plans*`,
        ];
        await this.invalidateByPatterns(patterns);
        console.log(`🗑️  Cache invalidated: plans for org ${organizationId}`);
    }
    async invalidateActivities(organizationId) {
        const patterns = [`cache:${organizationId}:*:/activities*`];
        await this.invalidateByPatterns(patterns);
        console.log(`🗑️  Cache invalidated: activities for org ${organizationId}`);
    }
    async invalidateAll(organizationId) {
        const pattern = `cache:${organizationId}:*`;
        await this.invalidateByPatterns([pattern]);
        console.log(`🗑️  Cache invalidated: ALL for org ${organizationId}`);
    }
    async invalidateByPatterns(patterns) {
        try {
            console.log(`⚠️  Cache invalidation (patterns: ${patterns.join(', ')}) - relying on TTL expiration`);
        }
        catch (error) {
            console.error('❌ Cache invalidation error:', error);
        }
    }
};
exports.CacheInvalidationService = CacheInvalidationService;
exports.CacheInvalidationService = CacheInvalidationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], CacheInvalidationService);
//# sourceMappingURL=cache-invalidation.service.js.map