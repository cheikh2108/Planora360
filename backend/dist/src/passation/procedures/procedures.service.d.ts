import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ProceduresService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(organizationId: string, userId: string, dto: any): Promise<{
        lignePPM: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            activityId: string | null;
            observations: string | null;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
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
    findAll(organizationId: string, filters?: any): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
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
    findOne(id: string, organizationId: string): Promise<{
        lignePPM: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            activityId: string | null;
            observations: string | null;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
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
    update(id: string, organizationId: string, dto: any): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
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
    remove(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
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
    publish(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
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
    close(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
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
    cancel(id: string, organizationId: string, motif: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusProcedure;
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
