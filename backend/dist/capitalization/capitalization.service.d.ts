import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCapitalizationDto } from './dto/create-capitalization.dto';
import { UpdateCapitalizationDto } from './dto/update-capitalization.dto';
import { FilterCapitalizationDto } from './dto/filter-capitalization.dto';
export declare class CapitalizationService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: StorageService);
    create(dto: CreateCapitalizationDto, organizationId: string, userId: string): Promise<{
        media: {
            id: string;
            type: string;
            url: string;
            uploadedAt: Date;
            size: number;
            capitalizationId: string;
            filename: string;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    findAll(organizationId: string, filters?: FilterCapitalizationDto): Promise<({
        media: {
            id: string;
            type: string;
            url: string;
            uploadedAt: Date;
            size: number;
            capitalizationId: string;
            filename: string;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    })[]>;
    private withMediaUrls;
    findOne(id: string, organizationId: string): Promise<{
        media: {
            id: string;
            type: string;
            url: string;
            uploadedAt: Date;
            size: number;
            capitalizationId: string;
            filename: string;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    update(id: string, dto: UpdateCapitalizationDto, organizationId: string, userId: string): Promise<{
        media: {
            id: string;
            type: string;
            url: string;
            uploadedAt: Date;
            size: number;
            capitalizationId: string;
            filename: string;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    remove(id: string, organizationId: string, userId: string): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    uploadMedia(capitalizationId: string, file: Express.Multer.File, type: string, organizationId: string): Promise<{
        url: string;
        id: string;
        type: string;
        uploadedAt: Date;
        size: number;
        capitalizationId: string;
        filename: string;
    }>;
    deleteMedia(mediaId: string, capitalizationId: string, organizationId: string): Promise<{
        id: string;
        type: string;
        url: string;
        uploadedAt: Date;
        size: number;
        capitalizationId: string;
        filename: string;
    }>;
}
