import { MessagerieService } from './messagerie.service';
import { ConversationType } from '@prisma/client';
export declare class MessagerieController {
    private readonly messagerieService;
    constructor(messagerieService: MessagerieService);
    getUserConversations(req: any): Promise<({
        participants: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            leftAt: Date | null;
            role: import(".prisma/client").$Enums.ConversationRole;
            conversationId: string;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
        })[];
        messages: ({
            author: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            conversationId: string;
            authorId: string;
            content: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            parentId: string | null;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        _count: {
            participants: number;
            messages: number;
        };
    } & {
        id: string;
        organizationId: string;
        type: import(".prisma/client").$Enums.ConversationType;
        name: string | null;
        description: string | null;
        avatarUrl: string | null;
        projectId: string | null;
        activityId: string | null;
        recommendationId: string | null;
        procedureId: string | null;
        contratId: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getConversation(req: any, conversationId: string): Promise<{
        participants: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            leftAt: Date | null;
            role: import(".prisma/client").$Enums.ConversationRole;
            conversationId: string;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
        })[];
        _count: {
            participants: number;
            messages: number;
        };
    } & {
        id: string;
        organizationId: string;
        type: import(".prisma/client").$Enums.ConversationType;
        name: string | null;
        description: string | null;
        avatarUrl: string | null;
        projectId: string | null;
        activityId: string | null;
        recommendationId: string | null;
        procedureId: string | null;
        contratId: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createConversation(req: any, type: ConversationType, name?: string, participantIds?: string[], context?: any): Promise<{
        participants: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            leftAt: Date | null;
            role: import(".prisma/client").$Enums.ConversationRole;
            conversationId: string;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        organizationId: string;
        type: import(".prisma/client").$Enums.ConversationType;
        name: string | null;
        description: string | null;
        avatarUrl: string | null;
        projectId: string | null;
        activityId: string | null;
        recommendationId: string | null;
        procedureId: string | null;
        contratId: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMessages(req: any, conversationId: string, limit?: number, before?: string): Promise<{
        messages: ({
            author: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            attachments: {
                id: string;
                messageId: string;
                fileName: string;
                fileUrl: string;
                fileSize: number;
                mimeType: string;
                thumbnailUrl: string | null;
                width: number | null;
                height: number | null;
                duration: number | null;
                uploadedAt: Date;
            }[];
            reactions: ({
                user: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                messageId: string;
                emoji: string;
            })[];
            mentions: {
                id: string;
                type: import(".prisma/client").$Enums.MentionType;
                createdAt: Date;
                userId: string;
                messageId: string;
                startPos: number | null;
                endPos: number | null;
                notified: boolean;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            conversationId: string;
            authorId: string;
            content: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            parentId: string | null;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    sendMessage(req: any, conversationId: string, content: string, contentType?: string, parentId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        attachments: {
            id: string;
            messageId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            thumbnailUrl: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            uploadedAt: Date;
        }[];
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        }[];
        mentions: {
            id: string;
            type: import(".prisma/client").$Enums.MentionType;
            createdAt: Date;
            userId: string;
            messageId: string;
            startPos: number | null;
            endPos: number | null;
            notified: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        conversationId: string;
        authorId: string;
        content: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        parentId: string | null;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    markConversationAsRead(req: any, conversationId: string): Promise<{
        success: boolean;
        markedCount: number;
    }>;
    deleteConversation(req: any, conversationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    archiveConversation(req: any, conversationId: string): Promise<{
        success: boolean;
        message: string;
        conversation: {
            id: string;
            organizationId: string;
            type: import(".prisma/client").$Enums.ConversationType;
            name: string | null;
            description: string | null;
            avatarUrl: string | null;
            projectId: string | null;
            activityId: string | null;
            recommendationId: string | null;
            procedureId: string | null;
            contratId: string | null;
            isArchived: boolean;
            lastMessageAt: Date | null;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    unarchiveConversation(req: any, conversationId: string): Promise<{
        success: boolean;
        message: string;
        conversation: {
            id: string;
            organizationId: string;
            type: import(".prisma/client").$Enums.ConversationType;
            name: string | null;
            description: string | null;
            avatarUrl: string | null;
            projectId: string | null;
            activityId: string | null;
            recommendationId: string | null;
            procedureId: string | null;
            contratId: string | null;
            isArchived: boolean;
            lastMessageAt: Date | null;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
