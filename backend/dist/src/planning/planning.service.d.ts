import { PrismaService } from '../common/prisma/prisma.service';
import { CreateAnnualWorkPlanDto } from './dto/create-annual-work-plan.dto';
import { UpdateAnnualWorkPlanDto } from './dto/update-annual-work-plan.dto';
import { UpdateResultsMatrixDto } from './dto/update-results-matrix.dto';
export declare class PlanningService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAnnualWorkPlan(dto: CreateAnnualWorkPlanDto, organizationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    findAllAnnualWorkPlans(organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }[]>;
    findOneAnnualWorkPlan(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    updateAnnualWorkPlan(id: string, dto: UpdateAnnualWorkPlanDto, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    validateAnnualWorkPlan(id: string, organizationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    deleteAnnualWorkPlan(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    getResultsMatrix(organizationId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        updatedAt: Date;
        organizationId: string;
    }>;
    updateResultsMatrix(dto: UpdateResultsMatrixDto, organizationId: string): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        updatedAt: Date;
        organizationId: string;
    }>;
}
