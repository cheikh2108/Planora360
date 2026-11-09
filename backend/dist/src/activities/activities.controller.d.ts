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
            _count: {
                checklistItems: number;
                validations: number;
                documents: number;
            };
            axis: {
                id: string;
                title: string;
                actionPlanId: string;
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
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string;
                status: import(".prisma/client").$Enums.ActivityStatus;
                description: string | null;
                startDate: Date;
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
                id: string;
                createdAt: Date;
                activityId: string;
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
                id: string;
                createdAt: Date;
                activityId: string;
                zoneId: string;
                isPrimary: boolean;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
            description: string | null;
            startDate: Date;
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
        _count: {
            checklistItems: number;
            validations: number;
            documents: number;
        };
        checklistItems: ({
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            activityId: string;
            responsibleId: string;
            dueDate: Date | null;
            order: number;
            label: string;
            isMandatory: boolean;
            progress: number;
            observations: string | null;
            isValidated: boolean;
        })[];
        axis: {
            id: string;
            title: string;
            actionPlanId: string;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
            description: string | null;
            startDate: Date;
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
            id: string;
            createdAt: Date;
            activityId: string;
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
            id: string;
            createdAt: Date;
            activityId: string;
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
            id: string;
            createdAt: Date;
            activityId: string;
            zoneId: string;
            isPrimary: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: import(".prisma/client").$Enums.ActivityStatus;
        description: string | null;
        startDate: Date;
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
        _count: {
            checklistItems: number;
            validations: number;
            documents: number;
        };
        axis: {
            id: string;
            title: string;
            actionPlanId: string;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
            description: string | null;
            startDate: Date;
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
            id: string;
            createdAt: Date;
            activityId: string;
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
            id: string;
            createdAt: Date;
            activityId: string;
            zoneId: string;
            isPrimary: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: import(".prisma/client").$Enums.ActivityStatus;
        description: string | null;
        startDate: Date;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: import(".prisma/client").$Enums.ActivityStatus;
        description: string | null;
        startDate: Date;
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
