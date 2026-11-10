import { MessagerieService } from './messagerie.service';
import { ConversationType } from '@prisma/client';
export declare class MessagerieController {
    private readonly messagerieService;
    constructor(messagerieService: MessagerieService);
    getUserConversations(req: any): Promise<({
        _count: {
            participants: number;
            messages: number;
        };
        participants: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: import(".prisma/client").$Enums.ConversationRole;
            id: string;
            userId: string;
            conversationId: string;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
            leftAt: Date | null;
        })[];
        messages: ({
            author: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            content: string;
            conversationId: string;
            authorId: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            parentId: string | null;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        name: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ConversationType;
        description: string | null;
        avatarUrl: string | null;
        projectId: string | null;
        recommendationId: string | null;
        procedureId: string | null;
        contratId: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
        createdById: string;
    })[]>;
    getConversation(req: any, conversationId: string): Promise<{
        _count: {
            participants: number;
            messages: number;
        };
        participants: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: import(".prisma/client").$Enums.ConversationRole;
            id: string;
            userId: string;
            conversationId: string;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
            leftAt: Date | null;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        name: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ConversationType;
        description: string | null;
        avatarUrl: string | null;
        projectId: string | null;
        recommendationId: string | null;
        procedureId: string | null;
        contratId: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
        createdById: string;
    }>;
    createConversation(req: any, type: ConversationType, name?: string, participantIds?: string[], context?: any): Promise<{
        participants: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: import(".prisma/client").$Enums.ConversationRole;
            id: string;
            userId: string;
            conversationId: string;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
            leftAt: Date | null;
        })[];
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        name: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ConversationType;
        description: string | null;
        avatarUrl: string | null;
        projectId: string | null;
        recommendationId: string | null;
        procedureId: string | null;
        contratId: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
        createdById: string;
    }>;
    getMessages(req: any, conversationId: string, limit?: number, before?: string): Promise<{
        messages: ({
            attachments: {
                fileSize: number;
                id: string;
                messageId: string;
                fileName: string;
                fileUrl: string;
                mimeType: string;
                thumbnailUrl: string | null;
                width: number | null;
                height: number | null;
                duration: number | null;
                uploadedAt: Date;
            }[];
            author: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
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
                createdAt: Date;
                userId: string;
                type: import(".prisma/client").$Enums.MentionType;
                messageId: string;
                startPos: number | null;
                endPos: number | null;
                notified: boolean;
            }[];
        } & {
            id: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            content: string;
            conversationId: string;
            authorId: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            parentId: string | null;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
        })[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    sendMessage(req: any, conversationId: string, content: string, contentType?: string, parentId?: string): Promise<{
        attachments: {
            fileSize: number;
            id: string;
            messageId: string;
            fileName: string;
            fileUrl: string;
            mimeType: string;
            thumbnailUrl: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            uploadedAt: Date;
        }[];
        author: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        }[];
        mentions: {
            id: string;
            createdAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.MentionType;
            messageId: string;
            startPos: number | null;
            endPos: number | null;
            notified: boolean;
        }[];
    } & {
        id: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        content: string;
        conversationId: string;
        authorId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        parentId: string | null;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
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
            organizationId: string;
            activityId: string | null;
            id: string;
            createdAt: Date;
            name: string | null;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ConversationType;
            description: string | null;
            avatarUrl: string | null;
            projectId: string | null;
            recommendationId: string | null;
            procedureId: string | null;
            contratId: string | null;
            isArchived: boolean;
            lastMessageAt: Date | null;
            createdById: string;
        };
    }>;
    unarchiveConversation(req: any, conversationId: string): Promise<{
        success: boolean;
        message: string;
        conversation: {
            organizationId: string;
            activityId: string | null;
            id: string;
            createdAt: Date;
            name: string | null;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ConversationType;
            description: string | null;
            avatarUrl: string | null;
            projectId: string | null;
            recommendationId: string | null;
            procedureId: string | null;
            contratId: string | null;
            isArchived: boolean;
            lastMessageAt: Date | null;
            createdById: string;
        };
    }>;
}
