import { ProceduresService } from './procedures.service';
export declare class ProceduresController {
    private readonly proceduresService;
    constructor(proceduresService: ProceduresService);
    create(req: any, dto: any): Promise<{
        lignePPM: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            activityId: string | null;
            ppmId: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
            reference: string;
            objet: string;
        } | null;
        responsable: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
            createdAt: Date;
            updatedAt: Date;
            status: string;
            activityId: string | null;
            ppmId: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
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
            fournisseurId: string;
            dateDepot: Date;
            procedureId: string;
            devise: string;
            numeroDepot: string;
            montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
            montantFinancier: import("@prisma/client-runtime-utils").Decimal;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
