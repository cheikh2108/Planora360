import { PrismaService } from '../common/prisma/prisma.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
export declare class ChecklistService {
    private prisma;
    constructor(prisma: PrismaService);
    private getActivity;
    create(activityId: string, dto: CreateChecklistItemDto, organizationId: string, currentUserId: string): Promise<{
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
    findAll(activityId: string, organizationId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    findOne(id: string, organizationId: string): Promise<{
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
            fileName: string;
            mimeType: string | null;
            checklistItemId: string | null;
            storageKey: string;
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
    update(id: string, dto: UpdateChecklistItemDto, organizationId: string): Promise<{
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
    remove(id: string, organizationId: string): Promise<void>;
    recalculateCompletionRate(activityId: string): Promise<void>;
}
