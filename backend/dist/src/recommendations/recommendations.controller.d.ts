import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { ChangeStatusDto, SuspendRecommendationDto, ReopenRecommendationDto } from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateActionDto } from './dto/create-action.dto';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    create(dto: CreateRecommendationDto, user: any): Promise<{
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        contributors: ({
            user: {
                id: string;
                email: string;
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
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        createdAt: Date;
        updatedAt: Date;
        validatorId: string | null;
        activityId: string | null;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        code: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        actionPlanId: string | null;
        issuerId: string | null;
        createdById: string;
    }>;
    findAll(user: any, filters: any): Promise<{
        recommendations: ({
            _count: {
                comments: number;
                actions: number;
                evidences: number;
                history: number;
            };
            actionPlan: {
                id: string;
                title: string;
            } | null;
            activity: {
                id: string;
                title: string;
            } | null;
            responsible: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            issuer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            validator: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            createdBy: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            contributors: ({
                user: {
                    id: string;
                    email: string;
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
            id: string;
            organizationId: string;
            status: import(".prisma/client").$Enums.RecommendationStatus;
            createdAt: Date;
            updatedAt: Date;
            validatorId: string | null;
            activityId: string | null;
            title: string;
            description: string;
            responsibleId: string;
            dueDate: Date;
            priority: import(".prisma/client").$Enums.RecommendationPriority;
            code: string;
            source: import(".prisma/client").$Enums.RecommendationSource;
            sourceReference: string | null;
            sourceDocumentUrl: string | null;
            issuedAt: Date;
            completedAt: Date | null;
            validatedAt: Date | null;
            issuerExternal: string | null;
            progress: number;
            suspendedReason: string | null;
            suspendedAt: Date | null;
            suspendedBy: string | null;
            reopenedReason: string | null;
            reopenedAt: Date | null;
            reopenedBy: string | null;
            isRecurrent: boolean;
            recurrenceNote: string | null;
            actionPlanId: string | null;
            issuerId: string | null;
            createdById: string;
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
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            authorId: string;
            recommendationId: string;
            content: string;
            isImportant: boolean;
        })[];
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        contributors: ({
            user: {
                id: string;
                email: string;
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
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            responsibleId: string | null;
            dueDate: Date | null;
            completedAt: Date | null;
            recommendationId: string;
            order: number;
        })[];
        evidences: ({
            uploadedBy: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            description: string | null;
            uploadedAt: Date;
            recommendationId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            uploadedById: string;
        })[];
        history: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            action: string;
            comment: string | null;
            recommendationId: string;
            field: string | null;
            oldValue: string | null;
            newValue: string | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        createdAt: Date;
        updatedAt: Date;
        validatorId: string | null;
        activityId: string | null;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        code: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        actionPlanId: string | null;
        issuerId: string | null;
        createdById: string;
    }>;
    update(id: string, dto: UpdateRecommendationDto, user: any): Promise<{
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        contributors: ({
            user: {
                id: string;
                email: string;
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
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        createdAt: Date;
        updatedAt: Date;
        validatorId: string | null;
        activityId: string | null;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        code: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        actionPlanId: string | null;
        issuerId: string | null;
        createdById: string;
    }>;
    changeStatus(id: string, dto: ChangeStatusDto, user: any): Promise<{
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        contributors: ({
            user: {
                id: string;
                email: string;
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
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        createdAt: Date;
        updatedAt: Date;
        validatorId: string | null;
        activityId: string | null;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        code: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        actionPlanId: string | null;
        issuerId: string | null;
        createdById: string;
    }>;
    suspend(id: string, dto: SuspendRecommendationDto, user: any): Promise<{
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        contributors: ({
            user: {
                id: string;
                email: string;
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
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        createdAt: Date;
        updatedAt: Date;
        validatorId: string | null;
        activityId: string | null;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        code: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        actionPlanId: string | null;
        issuerId: string | null;
        createdById: string;
    }>;
    reopen(id: string, dto: ReopenRecommendationDto, user: any): Promise<{
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        validator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        createdBy: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        contributors: ({
            user: {
                id: string;
                email: string;
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
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        createdAt: Date;
        updatedAt: Date;
        validatorId: string | null;
        activityId: string | null;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        code: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        actionPlanId: string | null;
        issuerId: string | null;
        createdById: string;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        createdAt: Date;
        updatedAt: Date;
        validatorId: string | null;
        activityId: string | null;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        code: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        actionPlanId: string | null;
        issuerId: string | null;
        createdById: string;
    }>;
    addAction(id: string, dto: CreateActionDto, user: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        responsibleId: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        recommendationId: string;
        order: number;
    }>;
    updateAction(actionId: string, updates: any, user: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        responsibleId: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        recommendationId: string;
        order: number;
    }>;
    deleteAction(actionId: string, user: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        responsibleId: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        recommendationId: string;
        order: number;
    }>;
    addComment(id: string, dto: CreateCommentDto, user: any): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        recommendationId: string;
        content: string;
        isImportant: boolean;
    }>;
    getComments(id: string, user: any): Promise<({
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        recommendationId: string;
        content: string;
        isImportant: boolean;
    })[]>;
}
