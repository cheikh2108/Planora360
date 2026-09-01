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
    getConversation(req: any, conversationId: string): Promise<{
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
    createConversation(req: any, type: ConversationType, name?: string, participantIds?: string[], context?: any): Promise<{
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
    sendMessage(req: any, conversationId: string, content: string, contentType?: string, parentId?: string): Promise<{
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
    unarchiveConversation(req: any, conversationId: string): Promise<{
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
