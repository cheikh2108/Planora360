import { MessagerieService } from './messagerie.service';
import { StorageService } from '../storage/storage.service';
export declare class UploadController {
    private readonly messagerieService;
    private readonly storageService;
    constructor(messagerieService: MessagerieService, storageService: StorageService);
    uploadFiles(conversationId: string, files: Express.Multer.File[], content: string, req: any): Promise<{
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
        };
    }>;
}
