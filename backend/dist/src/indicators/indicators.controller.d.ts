import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
export declare class IndicatorsController {
    private indicatorsService;
    constructor(indicatorsService: IndicatorsService);
    create(dto: CreateIndicatorDto, user: any): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        organizationId: string;
        title: string;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
    }>;
    findAll(user: any, activityId?: string, page?: string, limit?: string): Promise<{
        data: ({
            activity: {
                id: string;
                title: string;
            } | null;
        } & {
            id: string;
            organizationId: string;
            title: string;
            unit: string | null;
            baseline: number;
            target: number;
            achieved: number;
            dueDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, user: any): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        organizationId: string;
        title: string;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
    }>;
    update(id: string, dto: UpdateIndicatorDto, user: any): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        organizationId: string;
        title: string;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        organizationId: string;
        title: string;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        activityId: string | null;
    }>;
}
