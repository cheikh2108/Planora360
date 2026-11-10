import { PlanningService } from './planning.service';
import { CreateAnnualWorkPlanDto } from './dto/create-annual-work-plan.dto';
import { UpdateAnnualWorkPlanDto } from './dto/update-annual-work-plan.dto';
import { UpdateResultsMatrixDto } from './dto/update-results-matrix.dto';
export declare class PlanningController {
    private readonly planningService;
    constructor(planningService: PlanningService);
    createAnnualWorkPlan(dto: CreateAnnualWorkPlanDto, req: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    findAllAnnualWorkPlans(req: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }[]>;
    findOneAnnualWorkPlan(id: string, req: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    updateAnnualWorkPlan(id: string, dto: UpdateAnnualWorkPlanDto, req: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    validateAnnualWorkPlan(id: string, req: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    deleteAnnualWorkPlan(id: string, req: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        year: number;
        createdBy: string;
        objectives: import("@prisma/client/runtime/client").JsonValue;
        validatedBy: string | null;
        validatedAt: Date | null;
    }>;
    getResultsMatrix(req: any): Promise<{
        organizationId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        updatedAt: Date;
    }>;
    updateResultsMatrix(dto: UpdateResultsMatrixDto, req: any): Promise<{
        organizationId: string;
        data: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        updatedAt: Date;
    }>;
}
