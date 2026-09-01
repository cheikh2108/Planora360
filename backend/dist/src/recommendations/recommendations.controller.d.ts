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
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
            id: string;
            createdAt: Date;
            role: string | null;
            recommendationId: string;
            userId: string;
        })[];
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
    } & {
        id: string;
        code: string;
        title: string;
        description: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        dueDate: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        actionPlanId: string | null;
        activityId: string | null;
        organizationId: string;
        issuerId: string | null;
        responsibleId: string;
        validatorId: string | null;
        createdById: string;
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
            issuer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            responsible: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
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
                id: string;
                createdAt: Date;
                role: string | null;
                recommendationId: string;
                userId: string;
            })[];
            _count: {
                comments: number;
                actions: number;
                evidences: number;
                history: number;
            };
        } & {
            id: string;
            code: string;
            title: string;
            description: string;
            source: import(".prisma/client").$Enums.RecommendationSource;
            sourceReference: string | null;
            sourceDocumentUrl: string | null;
            issuedAt: Date;
            dueDate: Date;
            completedAt: Date | null;
            validatedAt: Date | null;
            issuerExternal: string | null;
            priority: import(".prisma/client").$Enums.RecommendationPriority;
            status: import(".prisma/client").$Enums.RecommendationStatus;
            progress: number;
            suspendedReason: string | null;
            suspendedAt: Date | null;
            suspendedBy: string | null;
            reopenedReason: string | null;
            reopenedAt: Date | null;
            reopenedBy: string | null;
            isRecurrent: boolean;
            recurrenceNote: string | null;
            createdAt: Date;
            updatedAt: Date;
            actionPlanId: string | null;
            activityId: string | null;
            organizationId: string;
            issuerId: string | null;
            responsibleId: string;
            validatorId: string | null;
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
            recommendationId: string;
            content: string;
            isImportant: boolean;
            authorId: string;
        })[];
        actionPlan: {
            id: string;
            title: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
            id: string;
            createdAt: Date;
            role: string | null;
            recommendationId: string;
            userId: string;
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
            title: string;
            description: string | null;
            dueDate: Date | null;
            completedAt: Date | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            responsibleId: string | null;
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
            recommendationId: string;
            uploadedAt: Date;
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
            recommendationId: string;
            userId: string;
            action: string;
            field: string | null;
            oldValue: string | null;
            newValue: string | null;
            comment: string | null;
        })[];
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
    } & {
        id: string;
        code: string;
        title: string;
        description: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        dueDate: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        actionPlanId: string | null;
        activityId: string | null;
        organizationId: string;
        issuerId: string | null;
        responsibleId: string;
        validatorId: string | null;
        createdById: string;
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
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
            id: string;
            createdAt: Date;
            role: string | null;
            recommendationId: string;
            userId: string;
        })[];
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
    } & {
        id: string;
        code: string;
        title: string;
        description: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        dueDate: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        actionPlanId: string | null;
        activityId: string | null;
        organizationId: string;
        issuerId: string | null;
        responsibleId: string;
        validatorId: string | null;
        createdById: string;
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
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
            id: string;
            createdAt: Date;
            role: string | null;
            recommendationId: string;
            userId: string;
        })[];
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
    } & {
        id: string;
        code: string;
        title: string;
        description: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        dueDate: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        actionPlanId: string | null;
        activityId: string | null;
        organizationId: string;
        issuerId: string | null;
        responsibleId: string;
        validatorId: string | null;
        createdById: string;
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
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
            id: string;
            createdAt: Date;
            role: string | null;
            recommendationId: string;
            userId: string;
        })[];
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
    } & {
        id: string;
        code: string;
        title: string;
        description: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        dueDate: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        actionPlanId: string | null;
        activityId: string | null;
        organizationId: string;
        issuerId: string | null;
        responsibleId: string;
        validatorId: string | null;
        createdById: string;
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
        issuer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
            id: string;
            createdAt: Date;
            role: string | null;
            recommendationId: string;
            userId: string;
        })[];
        _count: {
            comments: number;
            actions: number;
            evidences: number;
            history: number;
        };
    } & {
        id: string;
        code: string;
        title: string;
        description: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        dueDate: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        actionPlanId: string | null;
        activityId: string | null;
        organizationId: string;
        issuerId: string | null;
        responsibleId: string;
        validatorId: string | null;
        createdById: string;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        code: string;
        title: string;
        description: string;
        source: import(".prisma/client").$Enums.RecommendationSource;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        dueDate: Date;
        completedAt: Date | null;
        validatedAt: Date | null;
        issuerExternal: string | null;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        progress: number;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
        createdAt: Date;
        updatedAt: Date;
        actionPlanId: string | null;
        activityId: string | null;
        organizationId: string;
        issuerId: string | null;
        responsibleId: string;
        validatorId: string | null;
        createdById: string;
    }>;
    addAction(id: string, dto: CreateActionDto, user: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        responsibleId: string | null;
        recommendationId: string;
        order: number;
    }>;
    updateAction(actionId: string, updates: any, user: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        responsibleId: string | null;
        recommendationId: string;
        order: number;
    }>;
    deleteAction(actionId: string, user: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        responsibleId: string | null;
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
        recommendationId: string;
        content: string;
        isImportant: boolean;
        authorId: string;
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
        recommendationId: string;
        content: string;
        isImportant: boolean;
        authorId: string;
    })[]>;
}
