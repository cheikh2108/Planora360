import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
export declare class ProceduresService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(organizationId: string, userId: string, dto: any): Promise<{
        lignePPM: {
            activityId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
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
        organizationId: string;
        id: string;
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
    private nextReference;
    private assertDateOrder;
    private toProcedureData;
    findAll(organizationId: string, filters?: any): Promise<({
        lignePPM: {
            id: string;
            objet: string;
            reference: string;
        } | null;
        _count: {
            soumissions: number;
        };
        responsable: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        organizationId: string;
        id: string;
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
            activityId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
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
            email: string;
            id: string;
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
            procedureId: string;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
            fournisseurId: string;
            dateDepot: Date;
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
            procedureId: string;
            nom: string;
            dateSeance: Date;
            presidentId: string;
        })[];
    } & {
        organizationId: string;
        id: string;
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
    update(id: string, organizationId: string, dto: UpdateProcedureDto): Promise<{
        organizationId: string;
        id: string;
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
        organizationId: string;
        id: string;
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
        organizationId: string;
        id: string;
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
        organizationId: string;
        id: string;
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
        organizationId: string;
        id: string;
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
