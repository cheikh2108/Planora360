import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { ChangeStatusDto, SuspendRecommendationDto, ReopenRecommendationDto } from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateActionDto } from './dto/create-action.dto';
export declare class RecommendationsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    private verifyRecommendation;
    private generateCode;
    private logHistory;
    create(dto: CreateRecommendationDto, organizationId: string, userId: string): Promise<{
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
        createdBy: {
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
            userId: string;
            recommendationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    findAll(organizationId: string, filters?: any): Promise<({
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
        createdBy: {
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
            userId: string;
            recommendationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
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
            content: string;
            isImportant: boolean;
            recommendationId: string;
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
        createdBy: {
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
            createdAt: Date;
            updatedAt: Date;
            status: string;
            title: string;
            description: string | null;
            responsibleId: string | null;
            dueDate: Date | null;
            order: number;
            completedAt: Date | null;
            recommendationId: string;
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
            fileName: string;
            fileSize: number;
            mimeType: string;
            uploadedById: string;
            uploadedAt: Date;
            recommendationId: string;
            fileUrl: string;
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
            action: string;
            userId: string;
            comment: string | null;
            field: string | null;
            oldValue: string | null;
            newValue: string | null;
            recommendationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    update(id: string, dto: UpdateRecommendationDto, organizationId: string, userId: string): Promise<{
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
        createdBy: {
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
            userId: string;
            recommendationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    changeStatus(id: string, dto: ChangeStatusDto, organizationId: string, userId: string): Promise<{
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
        createdBy: {
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
            userId: string;
            recommendationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    suspend(id: string, dto: SuspendRecommendationDto, organizationId: string, userId: string): Promise<{
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
        createdBy: {
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
            userId: string;
            recommendationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    reopen(id: string, dto: ReopenRecommendationDto, organizationId: string, userId: string): Promise<{
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
        createdBy: {
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
            userId: string;
            recommendationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    delete(id: string, organizationId: string, userId: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RecommendationStatus;
        title: string;
        description: string;
        responsibleId: string;
        dueDate: Date;
        priority: import(".prisma/client").$Enums.RecommendationPriority;
        actionPlanId: string | null;
        activityId: string | null;
        progress: number;
        validatorId: string | null;
        source: import(".prisma/client").$Enums.RecommendationSource;
        validatedAt: Date | null;
        sourceReference: string | null;
        sourceDocumentUrl: string | null;
        issuedAt: Date;
        issuerId: string | null;
        issuerExternal: string | null;
        code: string;
        completedAt: Date | null;
        createdById: string;
        suspendedReason: string | null;
        suspendedAt: Date | null;
        suspendedBy: string | null;
        reopenedReason: string | null;
        reopenedAt: Date | null;
        reopenedBy: string | null;
        isRecurrent: boolean;
        recurrenceNote: string | null;
    }>;
    addAction(recommendationId: string, dto: CreateActionDto, organizationId: string, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        responsibleId: string | null;
        dueDate: Date | null;
        order: number;
        completedAt: Date | null;
        recommendationId: string;
    }>;
    updateAction(actionId: string, organizationId: string, updates: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        responsibleId: string | null;
        dueDate: Date | null;
        order: number;
        completedAt: Date | null;
        recommendationId: string;
    }>;
    deleteAction(actionId: string, organizationId: string, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        responsibleId: string | null;
        dueDate: Date | null;
        order: number;
        completedAt: Date | null;
        recommendationId: string;
    }>;
    addComment(recommendationId: string, dto: CreateCommentDto, organizationId: string, userId: string): Promise<{
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
        content: string;
        isImportant: boolean;
        recommendationId: string;
    }>;
    getComments(recommendationId: string, organizationId: string): Promise<({
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
        content: string;
        isImportant: boolean;
        recommendationId: string;
    })[]>;
    getStats(organizationId: string): Promise<{
        total: number;
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.RecommendationGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        byPriority: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.RecommendationGroupByOutputType, "priority"[]> & {
            _count: number;
        })[];
        overdue: number;
    }>;
}
