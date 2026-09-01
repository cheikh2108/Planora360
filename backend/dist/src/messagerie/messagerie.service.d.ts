import { PrismaService } from '../common/prisma/prisma.service';
import { ConversationType } from '@prisma/client';
export declare class MessagerieService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserConversations(userId: string, organizationId: string): Promise<({
        _count: {
            participants: number;
            messages: number;
        };
        participants: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: import(".prisma/client").$Enums.ConversationRole;
            id: string;
            userId: string;
            leftAt: Date | null;
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
            deletedAt: Date | null;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            authorId: string;
            content: string;
            conversationId: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            parentId: string | null;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
        })[];
    } & {
        id: string;
        organizationId: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
        description: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        createdById: string;
        recommendationId: string | null;
        projectId: string | null;
        procedureId: string | null;
        contratId: string | null;
        avatarUrl: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
    })[]>;
    getConversation(conversationId: string, userId: string): Promise<{
        _count: {
            participants: number;
            messages: number;
        };
        participants: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: import(".prisma/client").$Enums.ConversationRole;
            id: string;
            userId: string;
            leftAt: Date | null;
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
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
        description: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        createdById: string;
        recommendationId: string | null;
        projectId: string | null;
        procedureId: string | null;
        contratId: string | null;
        avatarUrl: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
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
            role: import(".prisma/client").$Enums.ConversationRole;
            id: string;
            userId: string;
            leftAt: Date | null;
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
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
        description: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        createdById: string;
        recommendationId: string | null;
        projectId: string | null;
        procedureId: string | null;
        contratId: string | null;
        avatarUrl: string | null;
        isArchived: boolean;
        lastMessageAt: Date | null;
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
            uploadedAt: Date;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            messageId: string;
            thumbnailUrl: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
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
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        parentId: string | null;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
    }>;
    sendMessageWithAttachments(conversationId: string, authorId: string, content: string, attachments: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        attachments: {
            id: string;
            uploadedAt: Date;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            messageId: string;
            thumbnailUrl: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
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
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        parentId: string | null;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
    }>;
    editMessage(messageId: string, authorId: string, content: string): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
        attachments: {
            id: string;
            uploadedAt: Date;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            messageId: string;
            thumbnailUrl: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
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
        deletedAt: Date | null;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        parentId: string | null;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
    }>;
    deleteMessage(messageId: string, authorId: string): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        parentId: string | null;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
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
        deletedAt: Date | null;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        parentId: string | null;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
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
                uploadedAt: Date;
                fileName: string;
                fileUrl: string;
                fileSize: number;
                mimeType: string;
                messageId: string;
                thumbnailUrl: string | null;
                width: number | null;
                height: number | null;
                duration: number | null;
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
            createdAt: Date;
            deletedAt: Date | null;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            authorId: string;
            content: string;
            conversationId: string;
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
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            description: string | null;
            type: import(".prisma/client").$Enums.ConversationType;
            createdById: string;
            recommendationId: string | null;
            projectId: string | null;
            procedureId: string | null;
            contratId: string | null;
            avatarUrl: string | null;
            isArchived: boolean;
            lastMessageAt: Date | null;
        };
    }>;
    unarchiveConversation(conversationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        conversation: {
            id: string;
            organizationId: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            description: string | null;
            type: import(".prisma/client").$Enums.ConversationType;
            createdById: string;
            recommendationId: string | null;
            projectId: string | null;
            procedureId: string | null;
            contratId: string | null;
            avatarUrl: string | null;
            isArchived: boolean;
            lastMessageAt: Date | null;
        };
    }>;
}
