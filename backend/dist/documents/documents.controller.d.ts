import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    uploadToActivity(activityId: string, file: Express.Multer.File, type: string, user: any): Promise<{
        activityId: string | null;
        fileSize: number | null;
        id: string;
        createdAt: Date;
        type: string;
        fileName: string;
        mimeType: string | null;
        checklistItemId: string | null;
        storageKey: string;
        uploadedById: string;
    }>;
    findByActivity(activityId: string, user: any): Promise<{
        activityId: string | null;
        fileSize: number | null;
        id: string;
        createdAt: Date;
        type: string;
        fileName: string;
        mimeType: string | null;
        checklistItemId: string | null;
        storageKey: string;
        uploadedById: string;
    }[]>;
    uploadToChecklist(itemId: string, file: Express.Multer.File, type: string, user: any): Promise<{
        activityId: string | null;
        fileSize: number | null;
        id: string;
        createdAt: Date;
        type: string;
        fileName: string;
        mimeType: string | null;
        checklistItemId: string | null;
        storageKey: string;
        uploadedById: string;
    }>;
    findByChecklistItem(itemId: string, user: any): Promise<{
        activityId: string | null;
        fileSize: number | null;
        id: string;
        createdAt: Date;
        type: string;
        fileName: string;
        mimeType: string | null;
        checklistItemId: string | null;
        storageKey: string;
        uploadedById: string;
    }[]>;
    getDownloadUrl(id: string, user: any): Promise<{
        url: string;
        fileName: string;
        mimeType: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        activityId: string | null;
        fileSize: number | null;
        id: string;
        createdAt: Date;
        type: string;
        fileName: string;
        mimeType: string | null;
        checklistItemId: string | null;
        storageKey: string;
        uploadedById: string;
    }>;
}
