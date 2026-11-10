import { PrismaService } from '../../common/prisma/prisma.service';
import { ValidationDecision } from '@prisma/client';
import { ValidationWorkflowService } from '../common/services/validation-workflow.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
export declare class DemandesService {
    private readonly prisma;
    private readonly workflowService;
    constructor(prisma: PrismaService, workflowService: ValidationWorkflowService);
    create(organizationId: string, userId: string, dto: CreateDemandeDto): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
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
        demandeur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        reference: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    private assertLinks;
    private toDemandeData;
    findAll(organizationId: string, filters?: any): Promise<({
        activity: {
            id: string;
            title: string;
        } | null;
        lignePPM: {
            id: string;
            objet: string;
            reference: string;
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
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        reference: string;
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
        validations: ({
            validateur: {
                email: string;
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
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        reference: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    update(id: string, organizationId: string, dto: UpdateDemandeDto): Promise<{
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
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        reference: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
    remove(id: string, organizationId: string): Promise<{
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        reference: string;
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
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        reference: string;
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
        organizationId: string;
        activityId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusDemandeAchat;
        description: string;
        objet: string;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        reference: string;
        justification: string;
        quantite: number | null;
        specifications: string | null;
        echeanceSouhaitee: Date | null;
        lignePPMId: string | null;
        demandeurId: string;
    }>;
}
