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
    getMessages(req: any, conversationId: string, limit?: number, before?: string): Promise<{
        messages: ({
            attachments: {
                id: string;
                fileSize: number;
                fileName: string;
                mimeType: string;
                width: number | null;
                uploadedAt: Date;
                fileUrl: string;
                messageId: string;
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
    sendMessage(req: any, conversationId: string, content: string, contentType?: string, parentId?: string): Promise<{
        attachments: {
            id: string;
            fileSize: number;
            fileName: string;
            mimeType: string;
            width: number | null;
            uploadedAt: Date;
            fileUrl: string;
            messageId: string;
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
    markConversationAsRead(req: any, conversationId: string): Promise<{
        success: boolean;
        markedCount: number;
    }>;
}
