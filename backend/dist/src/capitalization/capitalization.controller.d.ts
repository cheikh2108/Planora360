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
            capitalizationId: string;
            filename: string;
            url: string;
            size: number;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        type: string;
        title: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        tags: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        authorId: string;
    }>;
    findAll(filters: FilterCapitalizationDto, req: any): Promise<({
        media: {
            id: string;
            type: string;
            capitalizationId: string;
            filename: string;
            url: string;
            size: number;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        type: string;
        title: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        tags: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        authorId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        media: {
            id: string;
            type: string;
            capitalizationId: string;
            filename: string;
            url: string;
            size: number;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        type: string;
        title: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        tags: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        authorId: string;
    }>;
    update(id: string, dto: UpdateCapitalizationDto, req: any): Promise<{
        media: {
            id: string;
            type: string;
            capitalizationId: string;
            filename: string;
            url: string;
            size: number;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        type: string;
        title: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        tags: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        authorId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        type: string;
        title: string;
        context: string;
        challenges: string;
        solutions: string;
        results: string;
        lessons: string;
        tags: string[];
        status: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        authorId: string;
    }>;
    uploadMedia(id: string, file: Express.Multer.File, type: string, req: any): Promise<{
        id: string;
        type: string;
        capitalizationId: string;
        filename: string;
        url: string;
        size: number;
        uploadedAt: Date;
    }>;
    deleteMedia(id: string, mediaId: string, req: any): Promise<{
        id: string;
        type: string;
        capitalizationId: string;
        filename: string;
        url: string;
        size: number;
        uploadedAt: Date;
    }>;
}
