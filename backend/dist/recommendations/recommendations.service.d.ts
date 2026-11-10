import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { ChangeStatusDto, SuspendRecommendationDto, ReopenRecommendationDto } from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
export declare class RecommendationsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    private verifyRecommendation;
    private generateCode;
    private logHistory;
    create(dto: CreateRecommendationDto, organizationId: string, userId: string): Promise<{
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
    findAll(organizationId: string, filters?: any): Promise<{
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
    findOne(id: string, organizationId: string): Promise<{
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
    update(id: string, dto: UpdateRecommendationDto, organizationId: string, userId: string): Promise<{
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
    changeStatus(id: string, dto: ChangeStatusDto, organizationId: string, userId: string): Promise<{
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
    suspend(id: string, dto: SuspendRecommendationDto, organizationId: string, userId: string): Promise<{
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
    reopen(id: string, dto: ReopenRecommendationDto, organizationId: string, userId: string): Promise<{
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
    delete(id: string, organizationId: string, userId: string): Promise<{
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
    addAction(recommendationId: string, dto: CreateActionDto, organizationId: string, userId?: string): Promise<{
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
    private assertResponsible;
    updateAction(actionId: string, organizationId: string, dto: UpdateActionDto): Promise<{
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
    deleteAction(actionId: string, organizationId: string, userId?: string): Promise<{
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
    addComment(recommendationId: string, dto: CreateCommentDto, organizationId: string, userId: string): Promise<{
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
    getComments(recommendationId: string, organizationId: string): Promise<({
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
