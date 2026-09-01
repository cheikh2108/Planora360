import { PpmService } from './ppm.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
import { CreateLignePpmDto } from './dto/create-ligne-ppm.dto';
import { StatusPPM } from '@prisma/client';
export declare class PpmController {
    private readonly ppmService;
    constructor(ppmService: PpmService);
    create(req: any, createPpmDto: CreatePpmDto): Promise<{
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
    findAll(req: any, year?: number, status?: StatusPPM, projectId?: string): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, req: any, updatePpmDto: UpdatePpmDto): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    validate(id: string, req: any): Promise<{
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
    updateStatus(id: string, req: any, status: StatusPPM): Promise<{
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
    addLigne(id: string, req: any, ligneDto: CreateLignePpmDto): Promise<{
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
    export(id: string, req: any, format?: 'pdf' | 'excel'): Promise<{
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
