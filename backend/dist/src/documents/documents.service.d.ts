import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
export declare class DocumentsService {
    private prisma;
    private storage;
    constructor(prisma: PrismaService, storage: StorageService);
    uploadToActivity(activityId: string, file: Express.Multer.File, type: string, organizationId: string, uploadedById: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        activityId: string | null;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
    }>;
    uploadToChecklistItem(checklistItemId: string, file: Express.Multer.File, type: string, organizationId: string, uploadedById: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        activityId: string | null;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
    }>;
    findByActivity(activityId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        activityId: string | null;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
    }[]>;
    findByChecklistItem(checklistItemId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        activityId: string | null;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
    }[]>;
    getDownloadUrl(id: string, organizationId: string): Promise<{
        url: string;
        fileName: string;
        mimeType: string | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        activityId: string | null;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
    }>;
}
