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
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        activityId: string | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
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
            createdAt: Date;
            updatedAt: Date;
            title: string;
            dueDate: Date | null;
            activityId: string | null;
            unit: string | null;
            baseline: number;
            target: number;
            achieved: number;
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
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        activityId: string | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
    }>;
    update(id: string, dto: UpdateIndicatorDto, user: any): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        activityId: string | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dueDate: Date | null;
        activityId: string | null;
        unit: string | null;
        baseline: number;
        target: number;
        achieved: number;
    }>;
}
