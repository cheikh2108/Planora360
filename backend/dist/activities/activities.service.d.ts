import { ActivityStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { PostHogService } from '../analytics/posthog.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
export declare class ActivitiesService {
    private prisma;
    private posthog;
    private cacheInvalidation;
    constructor(prisma: PrismaService, posthog: PostHogService, cacheInvalidation: CacheInvalidationService);
    create(dto: CreateActivityDto, organizationId: string, currentUserId: string): Promise<any>;
    private validateAxis;
    private validateParentActivity;
    private validateResponsible;
    private validateZones;
    private createActivity;
    private addCollaborators;
    private assignZones;
    private findActivityById;
    findAll(organizationId: string, planId?: string, zoneId?: string, page?: number, limit?: number): Promise<{
        data: ({
            axis: {
                id: string;
                title: string;
                actionPlanId: string;
            };
            _count: {
                checklistItems: number;
                validations: number;
                documents: number;
            };
            subActivities: ({
                _count: {
                    checklistItems: number;
                };
                responsible: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                organizationId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                status: import(".prisma/client").$Enums.ActivityStatus;
                description: string | null;
                title: string;
                axisId: string;
                parentActivityId: string | null;
                expectedResults: string | null;
                responsibleId: string;
                dueDate: Date;
                priority: string;
                budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
                budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
                completionRate: number;
                risks: string | null;
            })[];
            responsible: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
            collaborators: ({
                user: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                activityId: string;
                id: string;
                createdAt: Date;
                userId: string;
            })[];
            zones: ({
                zone: {
                    id: string;
                    name: string;
                    code: string | null;
                    level: number;
                };
            } & {
                activityId: string;
                id: string;
                createdAt: Date;
                zoneId: string;
                isPrimary: boolean;
            })[];
        } & {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            description: string | null;
            title: string;
            axisId: string;
            parentActivityId: string | null;
            expectedResults: string | null;
            responsibleId: string;
            dueDate: Date;
            priority: string;
            budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
            budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            completionRate: number;
            risks: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, organizationId: string): Promise<{
        axis: {
            id: string;
            title: string;
            actionPlanId: string;
        };
        checklistItems: ({
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            activityId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            responsibleId: string;
            dueDate: Date | null;
            order: number;
            label: string;
            isMandatory: boolean;
            progress: number;
            observations: string | null;
            isValidated: boolean;
        })[];
        _count: {
            checklistItems: number;
            validations: number;
            documents: number;
        };
        subActivities: ({
            _count: {
                checklistItems: number;
            };
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            description: string | null;
            title: string;
            axisId: string;
            parentActivityId: string | null;
            expectedResults: string | null;
            responsibleId: string;
            dueDate: Date;
            priority: string;
            budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
            budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            completionRate: number;
            risks: string | null;
        })[];
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        validations: {
            activityId: string;
            id: string;
            createdAt: Date;
            step: import(".prisma/client").$Enums.ValidationStep;
            decision: import(".prisma/client").$Enums.ValidationDecision;
            validatorId: string;
            comment: string | null;
        }[];
        collaborators: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            activityId: string;
            id: string;
            createdAt: Date;
            userId: string;
        })[];
        zones: ({
            zone: {
                id: string;
                name: string;
                code: string | null;
                level: number;
            };
        } & {
            activityId: string;
            id: string;
            createdAt: Date;
            zoneId: string;
            isPrimary: boolean;
        })[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        status: import(".prisma/client").$Enums.ActivityStatus;
        description: string | null;
        title: string;
        axisId: string;
        parentActivityId: string | null;
        expectedResults: string | null;
        responsibleId: string;
        dueDate: Date;
        priority: string;
        budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
        budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
        completionRate: number;
        risks: string | null;
    }>;
    update(id: string, dto: UpdateActivityDto, organizationId: string): Promise<any>;
    updateStatus(id: string, newStatus: ActivityStatus, organizationId: string): Promise<{
        axis: {
            id: string;
            title: string;
            actionPlanId: string;
        };
        _count: {
            checklistItems: number;
            validations: number;
            documents: number;
        };
        subActivities: ({
            _count: {
                checklistItems: number;
            };
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            description: string | null;
            title: string;
            axisId: string;
            parentActivityId: string | null;
            expectedResults: string | null;
            responsibleId: string;
            dueDate: Date;
            priority: string;
            budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
            budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            completionRate: number;
            risks: string | null;
        })[];
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        collaborators: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            activityId: string;
            id: string;
            createdAt: Date;
            userId: string;
        })[];
        zones: ({
            zone: {
                id: string;
                name: string;
                code: string | null;
                level: number;
            };
        } & {
            activityId: string;
            id: string;
            createdAt: Date;
            zoneId: string;
            isPrimary: boolean;
        })[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        status: import(".prisma/client").$Enums.ActivityStatus;
        description: string | null;
        title: string;
        axisId: string;
        parentActivityId: string | null;
        expectedResults: string | null;
        responsibleId: string;
        dueDate: Date;
        priority: string;
        budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
        budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
        completionRate: number;
        risks: string | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        status: import(".prisma/client").$Enums.ActivityStatus;
        description: string | null;
        title: string;
        axisId: string;
        parentActivityId: string | null;
        expectedResults: string | null;
        responsibleId: string;
        dueDate: Date;
        priority: string;
        budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
        budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
        completionRate: number;
        risks: string | null;
    }>;
    importFromExcel(file: Express.Multer.File, planId: string, organizationId: string, userId: string): Promise<{
        success: number;
        errors: number;
        total: number;
        created: any[];
        errorDetails: {
            line: number;
            error: string;
        }[];
    }>;
    private sanitizeString;
    private parseExcelDate;
}
