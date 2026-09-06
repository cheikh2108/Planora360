import { MethodeProcedure } from '@prisma/client';
export declare class CreateProcedureDto {
    methode: MethodeProcedure;
    objet: string;
    description: string;
    montantEstimatif: number;
    lignePpmId?: string;
    datePublication?: string;
    dateLimite?: string;
    dateOuverture?: string;
    dateClarification?: string;
}
