import { MessagerieService } from './messagerie.service';
import { StorageService } from '../storage/storage.service';
export declare class UploadController {
    private readonly messagerieService;
    private readonly storageService;
    constructor(messagerieService: MessagerieService, storageService: StorageService);
    uploadFiles(conversationId: string, files: Express.Multer.File[], content: string, req: any): Promise<{
        success: boolean;
        message: {
            attachments: {
                id: string;
                fileSize: number;
                fileName: string;
                mimeType: string;
                width: number | null;
                uploadedAt: Date;
                fileUrl: string;
                thumbnailUrl: string | null;
                height: number | null;
                duration: number | null;
                messageId: string;
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
        };
    }>;
}
