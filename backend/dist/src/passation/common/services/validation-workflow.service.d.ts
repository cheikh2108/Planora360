import { PrismaService } from '../../../common/prisma/prisma.service';
import { WorkflowConfig, WorkflowResult } from '../types/validation-workflow.types';
export declare class ValidationWorkflowService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createWorkflow(config: WorkflowConfig): Promise<WorkflowResult>;
    private findValidator;
    private getHierarchicalValidator;
    private getTechnicalValidator;
    private getAdministrativeValidator;
    areAllValidationsApproved(demandeId: string): Promise<boolean>;
}
