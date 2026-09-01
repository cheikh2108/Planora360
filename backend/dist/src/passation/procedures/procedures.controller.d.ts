import { ProceduresService } from './procedures.service';
export declare class ProceduresController {
    private readonly proceduresService;
    constructor(proceduresService: ProceduresService);
    create(req: any, dto: any): Promise<{
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            dateAttribution: Date | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            responsableId: string;
            ppmId: string;
            activityId: string | null;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
        } | null;
        responsable: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    }>;
    findAll(req: any, filters: any): Promise<({
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
        } | null;
        responsable: {
            id: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            soumissions: number;
        };
    } & {
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            dateAttribution: Date | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            responsableId: string;
            ppmId: string;
            activityId: string | null;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
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
            dateDepot: Date;
            procedureId: string;
            numeroDepot: string;
            fournisseurId: string;
            montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
            montantFinancier: import("@prisma/client-runtime-utils").Decimal;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
            devise: string;
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
                id: string;
                role: string;
                commissionId: string;
                userId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            procedureId: string;
            nom: string;
            type: string;
            dateSeance: Date;
            presidentId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    }>;
    update(id: string, req: any, dto: any): Promise<{
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    }>;
    publish(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    }>;
    close(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    }>;
    cancel(id: string, req: any, motif: string): Promise<{
        id: string;
        organizationId: string;
        reference: string;
        methode: import(".prisma/client").$Enums.MethodeProcedure;
        objet: string;
        description: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        datePublication: Date | null;
        dateLimite: Date | null;
        dateOuverture: Date | null;
        dateClarification: Date | null;
        dateAttribution: Date | null;
        status: import(".prisma/client").$Enums.StatusProcedure;
        createdAt: Date;
        updatedAt: Date;
        demandeAchatId: string | null;
        lignePPMId: string | null;
        responsableId: string;
    }>;
}
