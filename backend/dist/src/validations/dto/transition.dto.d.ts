import { ValidationStep, ValidationDecision } from '@prisma/client';
export declare class TransitionDto {
    toStep: ValidationStep;
    decision: ValidationDecision;
    comment?: string;
}
