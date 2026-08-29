import { PrismaService } from '../../common/prisma/prisma.service';
import { ValidationDecision } from '@prisma/client';
import { ValidationWorkflowService } from '../common/services/validation-workflow.service';
export declare class DemandesService {
    private readonly prisma;
    private readonly workflowService;
    constructor(prisma: PrismaService, workflowService: ValidationWorkflowService);
    create(organizationId: string, userId: string, dto: any): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
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
        demandeur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        activityId: string | null;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    findAll(organizationId: string, filters?: any): Promise<({
        activity: {
            id: string;
            title: string;
        } | null;
        lignePPM: {
            id: string;
            reference: string;
            objet: string;
        } | null;
        validations: ({
            validateur: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            decision: string;
            validatedAt: Date | null;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            commentaire: string | null;
        })[];
        demandeur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        activityId: string | null;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
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
            decision: string;
            validatedAt: Date | null;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            commentaire: string | null;
        })[];
        demandeur: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        activityId: string | null;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    update(id: string, organizationId: string, dto: any): Promise<{
        validations: {
            id: string;
            createdAt: Date;
            decision: string;
            validatedAt: Date | null;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            commentaire: string | null;
        }[];
        demandeur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        activityId: string | null;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        activityId: string | null;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    submit(id: string, organizationId: string, userId: string): Promise<{
        validations: ({
            validateur: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            decision: string;
            validatedAt: Date | null;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            commentaire: string | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        activityId: string | null;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    validate(id: string, organizationId: string, userId: string, decision: ValidationDecision, commentaire?: string): Promise<{
        validations: ({
            validateur: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            decision: string;
            validatedAt: Date | null;
            demandeId: string;
            etape: string;
            ordre: number;
            validateurId: string;
            commentaire: string | null;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        activityId: string | null;
        description: string;
        reference: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
}
