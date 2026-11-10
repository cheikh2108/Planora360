import { CapitalizationService } from './capitalization.service';
import { CreateCapitalizationDto } from './dto/create-capitalization.dto';
import { UpdateCapitalizationDto } from './dto/update-capitalization.dto';
import { FilterCapitalizationDto } from './dto/filter-capitalization.dto';
export declare class CapitalizationController {
    private readonly capitalizationService;
    constructor(capitalizationService: CapitalizationService);
    create(dto: CreateCapitalizationDto, req: any): Promise<{
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
        type: string;
        status: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    findAll(filters: FilterCapitalizationDto, req: any): Promise<({
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
        type: string;
        status: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
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
        type: string;
        status: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    update(id: string, dto: UpdateCapitalizationDto, req: any): Promise<{
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
        type: string;
        status: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    remove(id: string, req: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        title: string;
        tags: string[];
        authorId: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
    }>;
    uploadMedia(id: string, file: Express.Multer.File, type: string, req: any): Promise<{
        url: string;
        id: string;
        type: string;
        uploadedAt: Date;
        size: number;
        capitalizationId: string;
        filename: string;
    }>;
    deleteMedia(id: string, mediaId: string, req: any): Promise<{
        id: string;
        type: string;
        url: string;
        uploadedAt: Date;
        size: number;
        capitalizationId: string;
        filename: string;
    }>;
}
