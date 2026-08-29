import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagerieService } from './messagerie.service';
export declare class MessagerieGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private messagerieService;
    server: Server;
    private connectedUsers;
    constructor(jwtService: JwtService, messagerieService: MessagerieService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSendMessage(client: Socket, data: {
        conversationId: string;
        content: string;
        parentId?: string;
        contentType?: string;
    }): Promise<{
        success: boolean;
        message: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    handleEditMessage(client: Socket, data: {
        messageId: string;
        content: string;
    }): Promise<{
        success: boolean;
        message: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    handleDeleteMessage(client: Socket, data: {
        messageId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleAddReaction(client: Socket, data: {
        messageId: string;
        emoji: string;
    }): Promise<{
        success: boolean;
        reaction: {
            id: string;
            createdAt: Date;
            userId: string;
            messageId: string;
            emoji: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        reaction?: undefined;
    }>;
    handleRemoveReaction(client: Socket, data: {
        reactionId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleTypingStart(client: Socket, data: {
        conversationId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleTypingStop(client: Socket, data: {
        conversationId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleMarkRead(client: Socket, data: {
        messageId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleJoinConversation(client: Socket, data: {
        conversationId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleLeaveConversation(client: Socket, data: {
        conversationId: string;
    }): Promise<{
        success: boolean;
    }>;
    isUserOnline(userId: string): boolean;
    getOnlineUsers(): string[];
}
