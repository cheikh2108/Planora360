import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private readonly logger;
    private s3;
    private bucket;
    private useLocal;
    constructor(config: ConfigService);
    upload(storageKey: string, file: Express.Multer.File): Promise<string>;
    getSignedUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
    getPublicUrl(storageKey: string): string;
    delete(storageKey: string): Promise<void>;
}
