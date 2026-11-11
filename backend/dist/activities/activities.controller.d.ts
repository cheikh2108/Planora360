import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ImportActivitiesDto } from './dto/import-activities.dto';
export declare class ActivitiesController {
    private activitiesService;
    constructor(activitiesService: ActivitiesService);
    create(dto: CreateActivityDto, user: any): Promise<any>;
    importFromExcel(file: Express.Multer.File, dto: ImportActivitiesDto, user: any): Promise<{
        success: number;
        errors: number;
        total: number;
        created: any[];
        errorDetails: {
            line: number;
            error: string;
        }[];
    }>;
    findAll(user: any, planId?: string, zoneId?: string, page?: string, limit?: string): Promise<{
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
                status: import(".prisma/client").$Enums.ActivityStatus;
                startDate: Date;
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
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date;
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
    findOne(id: string, user: any): Promise<{
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
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date;
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
        status: import(".prisma/client").$Enums.ActivityStatus;
        startDate: Date;
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
    update(id: string, dto: UpdateActivityDto, user: any): Promise<any>;
    updateStatus(id: string, dto: UpdateStatusDto, user: any): Promise<{
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
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date;
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
        status: import(".prisma/client").$Enums.ActivityStatus;
        startDate: Date;
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
    remove(id: string, user: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ActivityStatus;
        startDate: Date;
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
}
