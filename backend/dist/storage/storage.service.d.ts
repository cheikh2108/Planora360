import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private readonly logger;
    private s3;
    private bucket;
    private useLocal;
    private readonly localRoot;
    constructor(config: ConfigService);
    get isLocal(): boolean;
    buildKey(organizationId: string, segments: string[], extension: string): string;
    fileUrl(storageKey: string): string;
    keyFromStored(value: string): string;
    localPath(storageKey: string): string | null;
    upload(storageKey: string, file: Express.Multer.File): Promise<string>;
    getSignedUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
    delete(storageKey: string): Promise<void>;
}
