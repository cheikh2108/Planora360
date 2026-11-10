import { Cache } from 'cache-manager';
export declare class CacheInvalidationService {
    private cacheManager;
    private readonly logger;
    constructor(cacheManager: Cache);
    private versionKey;
    getVersion(organizationId: string): Promise<string>;
    invalidateAll(organizationId: string | null | undefined): Promise<void>;
    invalidateDashboard(organizationId: string): Promise<void>;
    invalidateUsers(organizationId: string): Promise<void>;
    invalidateRoles(organizationId: string): Promise<void>;
    invalidateOrganization(organizationId: string): Promise<void>;
    invalidatePlans(organizationId: string): Promise<void>;
    invalidateActivities(organizationId: string): Promise<void>;
}
