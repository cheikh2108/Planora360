import { DemandesService } from './demandes.service';
import { ValidationDecision } from '@prisma/client';
export declare class DemandesController {
    private readonly demandesService;
    constructor(demandesService: DemandesService);
    create(req: any, dto: any): Promise<{
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            ligneBudgetaire: string | null;
            sourceFinancement: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            ppmId: string;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        demandeur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    }>;
    findAll(req: any, filters: any): Promise<({
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        demandeur: {
            id: string;
            firstName: string;
            lastName: string;
        };
        validations: ({
            validateur: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            decision: string;
            commentaire: string | null;
            validatedAt: Date | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            ligneBudgetaire: string | null;
            sourceFinancement: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            ppmId: string;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        demandeur: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        validations: ({
            validateur: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            decision: string;
            commentaire: string | null;
            validatedAt: Date | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    }>;
    update(id: string, req: any, dto: any): Promise<{
        demandeur: {
            id: string;
            firstName: string;
            lastName: string;
        };
        validations: {
            id: string;
            createdAt: Date;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            decision: string;
            commentaire: string | null;
            validatedAt: Date | null;
        }[];
    } & {
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    }>;
    submit(id: string, req: any): Promise<{
        validations: ({
            validateur: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            decision: string;
            commentaire: string | null;
            validatedAt: Date | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    }>;
    validate(id: string, req: any, decision: ValidationDecision, commentaire?: string): Promise<{
        validations: ({
            validateur: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            decision: string;
            commentaire: string | null;
            validatedAt: Date | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    }>;
    getWorkflow(id: string, req: any): Promise<{
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            ligneBudgetaire: string | null;
            sourceFinancement: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            ppmId: string;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        } | null;
        activity: {
            id: string;
            title: string;
        } | null;
        demandeur: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        validations: ({
            validateur: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            decision: string;
            commentaire: string | null;
            validatedAt: Date | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        reference: string;
        objet: string;
        description: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        ligneBudgetaire: string | null;
        sourceFinancement: string | null;
        echeanceSouhaitee: Date | null;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        createdAt: Date;
        updatedAt: Date;
        lignePPMId: string | null;
        activityId: string | null;
        demandeurId: string;
    }>;
}
