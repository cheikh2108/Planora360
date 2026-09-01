import { ProceduresService } from './procedures.service';
export declare class ProceduresController {
    private readonly proceduresService;
    constructor(proceduresService: ProceduresService);
    create(req: any, dto: any): Promise<{
        lignePPM: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            observations: string | null;
            reference: string;
            ppmId: string;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        } | null;
        responsable: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    }>;
    findAll(req: any, filters: any): Promise<({
        _count: {
            soumissions: number;
        };
        lignePPM: {
            id: string;
            objet: string;
            reference: string;
        } | null;
        responsable: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    })[]>;
    findOne(id: string, req: any): Promise<{
        lignePPM: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            activityId: string | null;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            observations: string | null;
            reference: string;
            ppmId: string;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        } | null;
        responsable: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        soumissions: ({
            fournisseur: {
                id: string;
                raisonSociale: string;
                identifiantFiscal: string | null;
            };
        } & {
            id: string;
            status: string;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
            fournisseurId: string;
            dateDepot: Date;
            procedureId: string;
            devise: string;
            numeroDepot: string;
            montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
            montantFinancier: import("@prisma/client-runtime-utils").Decimal;
            conformeAdmin: boolean | null;
            conformeTechnique: boolean | null;
            conformeFinancier: boolean | null;
            horsDelai: boolean;
        })[];
        commissions: ({
            membres: ({
                user: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                role: string;
                id: string;
                userId: string;
                commissionId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            type: string;
            nom: string;
            procedureId: string;
            dateSeance: Date;
            presidentId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    }>;
    update(id: string, req: any, dto: any): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    }>;
    publish(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    }>;
    close(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    }>;
    cancel(id: string, req: any, motif: string): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        reference: string;
        dateAttribution: Date | null;
        responsableId: string;
        lignePPMId: string | null;
        demandeAchatId: string | null;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
    }>;
}
