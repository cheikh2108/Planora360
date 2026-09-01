import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    uploadToActivity(activityId: string, file: Express.Multer.File, type: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        type: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
        storageKey: string;
        checklistItemId: string | null;
    }>;
    findByActivity(activityId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        type: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
        storageKey: string;
        checklistItemId: string | null;
    }[]>;
    uploadToChecklist(itemId: string, file: Express.Multer.File, type: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        type: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
        storageKey: string;
        checklistItemId: string | null;
    }>;
    findByChecklistItem(itemId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        type: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
        storageKey: string;
        checklistItemId: string | null;
    }[]>;
    getDownloadUrl(id: string, user: any): Promise<{
        url: string;
        fileName: string;
        mimeType: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string | null;
        type: string;
        fileName: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedById: string;
        storageKey: string;
        checklistItemId: string | null;
    }>;
}
