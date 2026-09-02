import { PlanStatus } from '@prisma/client';
export declare class CreateAxisDto {
    title: string;
    order?: number;
}
export declare class CreateActionPlanDto {
    title: string;
    periodStart: string;
    periodEnd: string;
    strategicGoals?: string;
    expectedResults?: string;
    budgetPrevisional?: number;
    status?: PlanStatus;
    axes?: CreateAxisDto[];
    zoneIds?: string[];
}
