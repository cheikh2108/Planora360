export declare class UploadController {
    uploadFiles(files: Express.Multer.File[], req: any): Promise<{
        success: boolean;
        files: {
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            path: string;
            url: string;
        }[];
    }>;
}
