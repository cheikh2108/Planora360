import { Cache } from 'cache-manager';
export declare class CacheInvalidationService {
    private cacheManager;
    constructor(cacheManager: Cache);
    invalidateDashboard(organizationId: string): Promise<void>;
    invalidateUsers(organizationId: string): Promise<void>;
    invalidateRoles(organizationId: string): Promise<void>;
    invalidateOrganization(organizationId: string): Promise<void>;
    invalidatePlans(organizationId: string): Promise<void>;
    invalidateActivities(organizationId: string): Promise<void>;
    invalidateAll(organizationId: string): Promise<void>;
    private invalidateByPatterns;
}
