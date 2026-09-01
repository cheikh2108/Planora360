import { ChecklistService } from './checklist.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
export declare class ChecklistController {
    private checklistService;
    constructor(checklistService: ChecklistService);
    create(activityId: string, dto: CreateChecklistItemDto, user: any): Promise<{
        responsible: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        responsibleId: string;
        dueDate: Date | null;
        order: number;
        label: string;
        isMandatory: boolean;
        progress: number;
        observations: string | null;
        isValidated: boolean;
    }>;
    findAll(activityId: string, user: any): import(".prisma/client").Prisma.PrismaPromise<({
        responsible: {
            id: string;
            firstName: string;
            lastName: string;
        };
        documents: {
            id: string;
            createdAt: Date;
            type: string;
            fileName: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        responsibleId: string;
        dueDate: Date | null;
        order: number;
        label: string;
        isMandatory: boolean;
        progress: number;
        observations: string | null;
        isValidated: boolean;
    })[]>;
    findOne(id: string, user: any): Promise<{
        responsible: {
            id: string;
            firstName: string;
            lastName: string;
        };
        documents: {
            id: string;
            createdAt: Date;
            activityId: string | null;
            fileSize: number | null;
            type: string;
            checklistItemId: string | null;
            storageKey: string;
            fileName: string;
            mimeType: string | null;
            uploadedById: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        responsibleId: string;
        dueDate: Date | null;
        order: number;
        label: string;
        isMandatory: boolean;
        progress: number;
        observations: string | null;
        isValidated: boolean;
    }>;
    update(id: string, dto: UpdateChecklistItemDto, user: any): Promise<{
        responsible: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        responsibleId: string;
        dueDate: Date | null;
        order: number;
        label: string;
        isMandatory: boolean;
        progress: number;
        observations: string | null;
        isValidated: boolean;
    }>;
    remove(id: string, user: any): Promise<void>;
}
