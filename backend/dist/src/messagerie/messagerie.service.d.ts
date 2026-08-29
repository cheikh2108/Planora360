import { PrismaService } from '../common/prisma/prisma.service';
import { ConversationType } from '@prisma/client';
export declare class MessagerieService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserConversations(userId: string, organizationId: string): Promise<({
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
    getConversation(conversationId: string, userId: string): Promise<{
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
    createConversation(organizationId: string, createdById: string, type: ConversationType, name?: string, participantIds?: string[], context?: {
        projectId?: string;
        activityId?: string;
        recommendationId?: string;
        procedureId?: string;
        contratId?: string;
    }): Promise<{
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
    sendMessage(conversationId: string, authorId: string, content: string, contentType?: string, parentId?: string): Promise<{
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
    editMessage(messageId: string, authorId: string, content: string): Promise<{
        author: {
            id: string;
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
    deleteMessage(messageId: string, authorId: string): Promise<{
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
    getMessage(messageId: string): Promise<{
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
    }>;
    getMessages(conversationId: string, userId: string, limit?: number, before?: string): Promise<{
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
    addReaction(messageId: string, userId: string, emoji: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        messageId: string;
        emoji: string;
    }>;
    removeReaction(reactionId: string, userId: string): Promise<{
        messageId: string;
        conversationId: string;
    }>;
    markMessageAsRead(messageId: string, userId: string): Promise<{
        id: string;
        userId: string;
        messageId: string;
        readAt: Date;
    }>;
    markConversationAsRead(conversationId: string, userId: string): Promise<{
        success: boolean;
        markedCount: number;
    }>;
    deleteConversation(conversationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    archiveConversation(conversationId: string, userId: string): Promise<{
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
    unarchiveConversation(conversationId: string, userId: string): Promise<{
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
