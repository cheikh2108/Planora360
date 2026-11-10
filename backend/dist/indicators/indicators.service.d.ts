import { PrismaService } from '../common/prisma/prisma.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
export declare class IndicatorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateIndicatorDto, organizationId: string): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
    }>;
    findAll(organizationId: string, activityId?: string, page?: number, limit?: number): Promise<{
        data: ({
            activity: {
                id: string;
                title: string;
            } | null;
        } & {
            organizationId: string;
            activityId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            dueDate: Date | null;
            unit: string | null;
            baseline: number;
            target: number;
            achieved: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, organizationId: string): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
    }>;
    update(id: string, dto: UpdateIndicatorDto, organizationId: string): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
    }>;
    remove(id: string, organizationId: string): Promise<{
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
    }>;
}
