import { SecurityEventType, SecurityEventSeverity, SecurityEventStatus } from '@prisma/client';
export declare class SecurityEventFiltersDto {
    organizationId?: string;
    type?: SecurityEventType;
    severity?: SecurityEventSeverity;
    status?: SecurityEventStatus;
    email?: string;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
}
export declare class ResolveSecurityEventDto {
    resolution: string;
}
