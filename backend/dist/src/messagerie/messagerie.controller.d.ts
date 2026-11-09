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
            id: string;
            role: import(".prisma/client").$Enums.ConversationRole;
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
            deletedAt: Date | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            content: string;
            conversationId: string;
            authorId: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
            isEdited: boolean;
            editedAt: Date | null;
            isDeleted: boolean;
            isSystem: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string | null;
        description: string | null;
        activityId: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
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
            id: string;
            role: import(".prisma/client").$Enums.ConversationRole;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string | null;
        description: string | null;
        activityId: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
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
            id: string;
            role: import(".prisma/client").$Enums.ConversationRole;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        name: string | null;
        description: string | null;
        activityId: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
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
                id: string;
                fileSize: number;
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
            deletedAt: Date | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            content: string;
            conversationId: string;
            authorId: string;
            contentType: import(".prisma/client").$Enums.MessageContentType;
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
            id: string;
            fileSize: number;
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
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        content: string;
        conversationId: string;
        authorId: string;
        contentType: import(".prisma/client").$Enums.MessageContentType;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            name: string | null;
            description: string | null;
            activityId: string | null;
            type: import(".prisma/client").$Enums.ConversationType;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            name: string | null;
            description: string | null;
            activityId: string | null;
            type: import(".prisma/client").$Enums.ConversationType;
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
