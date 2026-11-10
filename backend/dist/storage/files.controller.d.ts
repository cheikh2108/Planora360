import { Response } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from './storage.service';
export declare class FilesController {
    private storage;
    private prisma;
    constructor(storage: StorageService, prisma: PrismaService);
    serve(rawKey: string | string[], user: any, res: Response): Promise<void>;
    private canAccess;
    private isParticipant;
}
