import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { ChangeStatusDto, SuspendRecommendationDto, ReopenRecommendationDto } from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    create(dto: CreateRecommendationDto, user: any): Promise<{
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        createdBy: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        contributors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            recommendationId: string;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        description: string;
        title: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        createdById: string;
        code: string;
        actionPlanId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        progress: number;
        validatorId: string | null;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        completedAt: Date | null;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    findAll(user: any, filters: any): Promise<{
        recommendations: ({
            actionPlan: {
                id: string;
                title: string;
            } | null;
            activity: {
                id: string;
                title: string;
            } | null;
            _count: {
                comments: number;
                actions: number;
                evidences: number;
                history: number;
            };
            responsible: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
            createdBy: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
            issuer: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            } | null;
            validator: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            } | null;
            contributors: ({
                user: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                role: string | null;
                id: string;
                createdAt: Date;
                userId: string;
                recommendationId: string;
            })[];
        } & {
            organizationId: string;
            activityId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.RecommendationStatus;
            description: string;
            title: string;
            responsibleId: string;
            dueDate: Date;
            priority: import(".prisma/client").$Enums.RecommendationPriority;
            createdById: string;
            code: string;
            actionPlanId: string | null;
            source: import(".prisma/client").$Enums.RecommendationSource;
            progress: number;
            validatorId: string | null;
            validatedAt: Date | null;
            sourceReference: string | null;
            sourceDocumentUrl: string | null;
            issuedAt: Date;
            issuerId: string | null;
            issuerExternal: string | null;
            completedAt: Date | null;
            suspendedReason: string | null;
            suspendedAt: Date | null;
            suspendedBy: string | null;
            reopenedReason: string | null;
            reopenedAt: Date | null;
            reopenedBy: string | null;
            isRecurrent: boolean;
            recurrenceNote: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(user: any): Promise<{
        total: number;
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.RecommendationGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        byPriority: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.RecommendationGroupByOutputType, "priority"[]> & {
            _count: number;
        })[];
        overdue: number;
    }>;
    findOne(id: string, user: any): Promise<{
        comments: ({
            author: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            recommendationId: string;
            authorId: string;
            isImportant: boolean;
        })[];
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        createdBy: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        contributors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            recommendationId: string;
        })[];
        actions: ({
            responsible: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            description: string | null;
            title: string;
            responsibleId: string | null;
            dueDate: Date | null;
            recommendationId: string;
            order: number;
            completedAt: Date | null;
        })[];
        evidences: ({
            uploadedBy: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            fileSize: number;
            id: string;
            description: string | null;
            recommendationId: string;
            fileName: string;
            fileUrl: string;
            mimeType: string;
            uploadedAt: Date;
            uploadedById: string;
        })[];
        history: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            action: string;
            createdAt: Date;
            userId: string;
            recommendationId: string;
            comment: string | null;
            field: string | null;
            oldValue: string | null;
            newValue: string | null;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        description: string;
        title: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        createdById: string;
        code: string;
        actionPlanId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        progress: number;
        validatorId: string | null;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        completedAt: Date | null;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    update(id: string, dto: UpdateRecommendationDto, user: any): Promise<{
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        createdBy: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        contributors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            recommendationId: string;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        description: string;
        title: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        createdById: string;
        code: string;
        actionPlanId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        progress: number;
        validatorId: string | null;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        completedAt: Date | null;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    changeStatus(id: string, dto: ChangeStatusDto, user: any): Promise<{
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        createdBy: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        contributors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            recommendationId: string;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        description: string;
        title: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        createdById: string;
        code: string;
        actionPlanId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        progress: number;
        validatorId: string | null;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        completedAt: Date | null;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    suspend(id: string, dto: SuspendRecommendationDto, user: any): Promise<{
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        createdBy: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        contributors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            recommendationId: string;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        description: string;
        title: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        createdById: string;
        code: string;
        actionPlanId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        progress: number;
        validatorId: string | null;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        completedAt: Date | null;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    reopen(id: string, dto: ReopenRecommendationDto, user: any): Promise<{
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        responsible: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        createdBy: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        contributors: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            recommendationId: string;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        description: string;
        title: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        createdById: string;
        code: string;
        actionPlanId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        progress: number;
        validatorId: string | null;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        completedAt: Date | null;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        description: string;
        title: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        createdById: string;
        code: string;
        actionPlanId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        progress: number;
        validatorId: string | null;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        completedAt: Date | null;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    addAction(id: string, dto: CreateActionDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        title: string;
        responsibleId: string | null;
        dueDate: Date | null;
        recommendationId: string;
        order: number;
        completedAt: Date | null;
    }>;
    updateAction(actionId: string, updates: UpdateActionDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        title: string;
        responsibleId: string | null;
        dueDate: Date | null;
        recommendationId: string;
        order: number;
        completedAt: Date | null;
    }>;
    deleteAction(actionId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        description: string | null;
        title: string;
        responsibleId: string | null;
        dueDate: Date | null;
        recommendationId: string;
        order: number;
        completedAt: Date | null;
    }>;
    addComment(id: string, dto: CreateCommentDto, user: any): Promise<{
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        recommendationId: string;
        authorId: string;
        isImportant: boolean;
    }>;
    getComments(id: string, user: any): Promise<({
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        recommendationId: string;
        authorId: string;
        isImportant: boolean;
    })[]>;
}
