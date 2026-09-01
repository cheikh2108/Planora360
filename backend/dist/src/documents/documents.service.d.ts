import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PostHogService } from '../analytics/posthog.service';
export declare class DocumentsService {
    private prisma;
    private storage;
    private posthog;
    constructor(prisma: PrismaService, storage: StorageService, posthog: PostHogService);
    uploadToActivity(activityId: string, file: Express.Multer.File, type: string, organizationId: string, uploadedById: string): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        fileSize: number | null;
        type: string;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        mimeType: string | null;
        uploadedById: string;
    }>;
    uploadToChecklistItem(checklistItemId: string, file: Express.Multer.File, type: string, organizationId: string, uploadedById: string): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        fileSize: number | null;
        type: string;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        mimeType: string | null;
        uploadedById: string;
    }>;
    findByActivity(activityId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        fileSize: number | null;
        type: string;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        mimeType: string | null;
        uploadedById: string;
    }[]>;
    findByChecklistItem(checklistItemId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        fileSize: number | null;
        type: string;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
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
        activityId: string | null;
        fileSize: number | null;
        type: string;
        checklistItemId: string | null;
        storageKey: string;
        fileName: string;
        mimeType: string | null;
        uploadedById: string;
    }>;
}
