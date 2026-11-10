import { PrismaService } from '../common/prisma/prisma.service';
import { MessagerieService } from './messagerie.service';
import { StorageService } from '../storage/storage.service';
export declare class UploadController {
    private readonly messagerieService;
    private readonly storageService;
    private readonly prisma;
    constructor(messagerieService: MessagerieService, storageService: StorageService, prisma: PrismaService);
    uploadFiles(conversationId: string, files: Express.Multer.File[], content: string, req: any): Promise<{
        success: boolean;
        message: {
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
        };
    }>;
}
