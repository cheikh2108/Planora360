import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsController {
    private budgetsService;
    constructor(budgetsService: BudgetsService);
    create(activityId: string, dto: CreateBudgetDto, user: any): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }>;
    findByActivity(activityId: string, user: any): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }[]>;
    update(id: string, dto: UpdateBudgetDto, user: any): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }>;
    getSummary(user: any): Promise<{
        totalPlanned: number;
        totalCommitted: number;
        totalDisbursed: number;
        totalExecuted: number;
        executionRate: number;
        commitmentRate: number;
        availableBalance: number;
        remainingToPay: number;
        byActivity: {
            activityId: any;
            title: any;
            planned: any;
            committed: any;
            executed: any;
            rate: number;
            fundingSource: any;
        }[];
    }>;
    getSummaryByPlan(planId: string, user: any): Promise<{
        totalPlanned: number;
        totalCommitted: number;
        totalDisbursed: number;
        totalExecuted: number;
        executionRate: number;
        commitmentRate: number;
        availableBalance: number;
        remainingToPay: number;
        byActivity: {
            activityId: any;
            title: any;
            planned: any;
            committed: any;
            executed: any;
            rate: number;
            fundingSource: any;
        }[];
    }>;
}
