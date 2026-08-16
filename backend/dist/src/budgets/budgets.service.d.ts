import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    private verifyActivity;
    private validateBudgetCascade;
    createForActivity(activityId: string, dto: CreateBudgetDto, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }>;
    findByActivity(activityId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }[]>;
    update(id: string, dto: UpdateBudgetDto, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        activityId: string;
        planned: import("@prisma/client-runtime-utils").Decimal;
        committed: import("@prisma/client-runtime-utils").Decimal;
        disbursed: import("@prisma/client-runtime-utils").Decimal;
        executed: import("@prisma/client-runtime-utils").Decimal;
        fundingSource: string | null;
    }>;
    private buildSummary;
    getSummaryByPlan(planId: string, organizationId: string): Promise<{
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
    getSummaryByOrganization(organizationId: string): Promise<{
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
