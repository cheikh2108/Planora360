import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    uploadToActivity(activityId: string, file: Express.Multer.File, type: string, user: any): Promise<{
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
    findByActivity(activityId: string, user: any): Promise<{
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
    uploadToChecklist(itemId: string, file: Express.Multer.File, type: string, user: any): Promise<{
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
    findByChecklistItem(itemId: string, user: any): Promise<{
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
    getDownloadUrl(id: string, user: any): Promise<{
        url: string;
        fileName: string;
        mimeType: string | null;
    }>;
    remove(id: string, user: any): Promise<{
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
