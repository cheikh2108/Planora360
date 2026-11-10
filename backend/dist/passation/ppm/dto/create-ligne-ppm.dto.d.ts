import { MethodeProcedure } from '@prisma/client';
export declare class CreateLignePpmDto {
    objet: string;
    montantEstimatif: number;
    methodeProcedure: MethodeProcedure;
    trimestre: number;
    sourceFinancement?: string;
    ligneBudgetaire?: string;
    observations?: string;
    activityId?: string;
}
