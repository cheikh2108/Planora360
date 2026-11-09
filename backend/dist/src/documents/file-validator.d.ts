export declare const DOCUMENT_EXTENSIONS: string[];
export declare const MEDIA_EXTENSIONS: string[];
export declare function validateFile(file: Express.Multer.File, opts?: {
    allowed?: string[];
    maxSize?: number;
}): Promise<string>;
