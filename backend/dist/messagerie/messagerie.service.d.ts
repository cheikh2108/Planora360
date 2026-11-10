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
    getConversation(conversationId: string, userId: string): Promise<{
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
    private validateContext;
    isParticipant(conversationId: string, userId: string, organizationId: string): Promise<boolean>;
    createConversation(organizationId: string, createdById: string, type: ConversationType, name?: string, participantIds?: string[], context?: {
        projectId?: string;
        activityId?: string;
        recommendationId?: string;
        procedureId?: string;
        contratId?: string;
    }): Promise<{
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
    sendMessage(conversationId: string, authorId: string, content: string, contentType?: string, parentId?: string): Promise<{
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
    sendMessageWithAttachments(conversationId: string, authorId: string, content: string, attachments: Array<{
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>): Promise<{
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
    editMessage(messageId: string, authorId: string, content: string): Promise<{
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
    deleteMessage(messageId: string, authorId: string): Promise<{
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
    getMessage(messageId: string): Promise<{
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
    }>;
    getMessages(conversationId: string, userId: string, limit?: number, before?: string): Promise<{
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
    unarchiveConversation(conversationId: string, userId: string): Promise<{
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
