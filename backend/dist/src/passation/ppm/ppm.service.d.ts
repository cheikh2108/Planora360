import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
import { CreateLignePpmDto } from './dto/create-ligne-ppm.dto';
import { StatusPPM } from '@prisma/client';
export declare class PpmService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(organizationId: string, userId: string, dto: CreatePpmDto): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        title: string;
        validatedAt: Date | null;
        createdBy: string;
        projectId: string | null;
        reference: string;
        validatedBy: string | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
    }>;
    findAll(organizationId: string, filters?: {
        year?: number;
        status?: StatusPPM;
        projectId?: string;
    }): Promise<({
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        title: string;
        validatedAt: Date | null;
        createdBy: string;
        projectId: string | null;
        reference: string;
        validatedBy: string | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        lignes: ({
            activity: {
                id: string;
                title: string;
            } | null;
            responsable: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
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
        })[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        title: string;
        validatedAt: Date | null;
        createdBy: string;
        projectId: string | null;
        reference: string;
        validatedBy: string | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
    }>;
    update(id: string, organizationId: string, dto: UpdatePpmDto): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        title: string;
        validatedAt: Date | null;
        createdBy: string;
        projectId: string | null;
        reference: string;
        validatedBy: string | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        title: string;
        validatedAt: Date | null;
        createdBy: string;
        projectId: string | null;
        reference: string;
        validatedBy: string | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
    }>;
    validate(id: string, organizationId: string, userId: string): Promise<{
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        title: string;
        validatedAt: Date | null;
        createdBy: string;
        projectId: string | null;
        reference: string;
        validatedBy: string | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
    }>;
    updateStatus(id: string, organizationId: string, newStatus: StatusPPM): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        title: string;
        validatedAt: Date | null;
        createdBy: string;
        projectId: string | null;
        reference: string;
        validatedBy: string | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
    }>;
    addLigne(ppmId: string, organizationId: string, userId: string, ligneDto: CreateLignePpmDto): Promise<{
        activity: {
            id: string;
            title: string;
        } | null;
        responsable: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
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
    }>;
    export(id: string, organizationId: string, format: 'pdf' | 'excel'): Promise<{
        format: "pdf" | "excel";
        data: {
            project: {
                id: string;
                title: string;
            } | null;
            lignes: ({
                activity: {
                    id: string;
                    title: string;
                } | null;
                responsable: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
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
            })[];
        } & {
            id: string;
            organizationId: string;
            status: import(".prisma/client").$Enums.StatusPPM;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            title: string;
            validatedAt: Date | null;
            createdBy: string;
            projectId: string | null;
            reference: string;
            validatedBy: string | null;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
            nombreLignes: number;
        };
    }>;
}
