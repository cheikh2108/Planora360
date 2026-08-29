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
            id: string;
            role: import(".prisma/client").$Enums.ConversationRole;
            userId: string;
            leftAt: Date | null;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
            conversationId: string;
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
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            authorId: string;
            content: string;
            conversationId: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
            parentId: string | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        activityId: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        description: string | null;
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
            id: string;
            role: import(".prisma/client").$Enums.ConversationRole;
            userId: string;
            leftAt: Date | null;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
            conversationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        activityId: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        description: string | null;
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
            id: string;
            role: import(".prisma/client").$Enums.ConversationRole;
            userId: string;
            leftAt: Date | null;
            isMuted: boolean;
            isPinned: boolean;
            lastReadAt: Date | null;
            unreadCount: number;
            joinedAt: Date;
            conversationId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        activityId: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        description: string | null;
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
        attachments: {
            id: string;
            fileSize: number;
            fileName: string;
            mimeType: string;
            width: number | null;
            uploadedAt: Date;
            messageId: string;
            fileUrl: string;
            thumbnailUrl: string | null;
            height: number | null;
            duration: number | null;
        }[];
        author: {
            id: string;
            email: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
        parentId: string | null;
    }>;
    editMessage(messageId: string, authorId: string, content: string): Promise<{
        attachments: {
            id: string;
            fileSize: number;
            fileName: string;
            mimeType: string;
            width: number | null;
            uploadedAt: Date;
            messageId: string;
            fileUrl: string;
            thumbnailUrl: string | null;
            height: number | null;
            duration: number | null;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
        parentId: string | null;
    }>;
    deleteMessage(messageId: string, authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
        parentId: string | null;
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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        authorId: string;
        content: string;
        conversationId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
        isEdited: boolean;
        editedAt: Date | null;
        isDeleted: boolean;
        isSystem: boolean;
        parentId: string | null;
    }>;
    getMessages(conversationId: string, userId: string, limit?: number, before?: string): Promise<{
        messages: ({
            attachments: {
                id: string;
                fileSize: number;
                fileName: string;
                mimeType: string;
                width: number | null;
                uploadedAt: Date;
                messageId: string;
                fileUrl: string;
                thumbnailUrl: string | null;
                height: number | null;
                duration: number | null;
            }[];
            author: {
                id: string;
                email: string;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            authorId: string;
            content: string;
            conversationId: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
            parentId: string | null;
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
}
