export interface ValidationStep {
    etape: string;
    ordre: number;
    validateurId: string;
}
export interface WorkflowConfig {
    amount: number;
    organizationId: string;
    requesterId: string;
}
export interface WorkflowResult {
    steps: ValidationStep[];
    workflowType: 'HIERARCHICAL_ONLY' | 'WITH_TECHNICAL' | 'FULL_VALIDATION';
}
