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
    findAll(filters: FilterCapitalizationDto, req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, dto: UpdateCapitalizationDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    uploadMedia(id: string, file: Express.Multer.File, type: string, req: any): Promise<{
        id: string;
        url: string;
        type: string;
        size: number;
        capitalizationId: string;
        filename: string;
        uploadedAt: Date;
    }>;
    deleteMedia(id: string, mediaId: string, req: any): Promise<{
        id: string;
        url: string;
        type: string;
        size: number;
        capitalizationId: string;
        filename: string;
        uploadedAt: Date;
    }>;
}
