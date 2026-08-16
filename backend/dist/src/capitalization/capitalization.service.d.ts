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
            url: string;
            type: string;
            size: number;
            capitalizationId: string;
            filename: string;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tags: string[];
        title: string;
        type: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        authorId: string;
    }>;
    findAll(organizationId: string, filters?: FilterCapitalizationDto): Promise<({
        media: {
            id: string;
            url: string;
            type: string;
            size: number;
            capitalizationId: string;
            filename: string;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tags: string[];
        title: string;
        type: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        authorId: string;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        media: {
            id: string;
            url: string;
            type: string;
            size: number;
            capitalizationId: string;
            filename: string;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tags: string[];
        title: string;
        type: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        authorId: string;
    }>;
    update(id: string, dto: UpdateCapitalizationDto, organizationId: string, userId: string): Promise<{
        media: {
            id: string;
            url: string;
            type: string;
            size: number;
            capitalizationId: string;
            filename: string;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tags: string[];
        title: string;
        type: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        authorId: string;
    }>;
    remove(id: string, organizationId: string, userId: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tags: string[];
        title: string;
        type: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        authorId: string;
    }>;
    uploadMedia(capitalizationId: string, file: Express.Multer.File, type: string, organizationId: string): Promise<{
        id: string;
        url: string;
        type: string;
        size: number;
        capitalizationId: string;
        filename: string;
        uploadedAt: Date;
    }>;
    deleteMedia(mediaId: string, capitalizationId: string, organizationId: string): Promise<{
        id: string;
        url: string;
        type: string;
        size: number;
        capitalizationId: string;
        filename: string;
        uploadedAt: Date;
    }>;
}
