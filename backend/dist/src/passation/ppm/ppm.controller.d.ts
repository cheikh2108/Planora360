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
            reference: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ppmId: string;
            objet: string;
            activityId: string | null;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        }[];
    } & {
        id: string;
        reference: string;
        year: number;
        title: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        validatedBy: string | null;
        validatedAt: Date | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        projectId: string | null;
    }>;
    findAll(req: any, year?: number, status?: StatusPPM, projectId?: string): Promise<({
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
            id: string;
            reference: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ppmId: string;
            objet: string;
            activityId: string | null;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        }[];
    } & {
        id: string;
        reference: string;
        year: number;
        title: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        validatedBy: string | null;
        validatedAt: Date | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        projectId: string | null;
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
            reference: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ppmId: string;
            objet: string;
            activityId: string | null;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        })[];
    } & {
        id: string;
        reference: string;
        year: number;
        title: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        validatedBy: string | null;
        validatedAt: Date | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        projectId: string | null;
    }>;
    update(id: string, req: any, updatePpmDto: UpdatePpmDto): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
            id: string;
            reference: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ppmId: string;
            objet: string;
            activityId: string | null;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        }[];
    } & {
        id: string;
        reference: string;
        year: number;
        title: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        validatedBy: string | null;
        validatedAt: Date | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        projectId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        reference: string;
        year: number;
        title: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        validatedBy: string | null;
        validatedAt: Date | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        projectId: string | null;
    }>;
    validate(id: string, req: any): Promise<{
        lignes: {
            id: string;
            reference: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ppmId: string;
            objet: string;
            activityId: string | null;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        }[];
    } & {
        id: string;
        reference: string;
        year: number;
        title: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        validatedBy: string | null;
        validatedAt: Date | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        projectId: string | null;
    }>;
    updateStatus(id: string, req: any, status: StatusPPM): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
            id: string;
            reference: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ppmId: string;
            objet: string;
            activityId: string | null;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            sourceFinancement: string | null;
            ligneBudgetaire: string | null;
            methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
            trimestre: number;
            observations: string | null;
            dateLancement: Date | null;
            dateAttribution: Date | null;
            dateSignature: Date | null;
            dateExecution: Date | null;
            responsableId: string;
        }[];
    } & {
        id: string;
        reference: string;
        year: number;
        title: string;
        status: import(".prisma/client").$Enums.StatusPPM;
        validatedBy: string | null;
        validatedAt: Date | null;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        nombreLignes: number;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        projectId: string | null;
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
        reference: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ppmId: string;
        objet: string;
        activityId: string | null;
        montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
        sourceFinancement: string | null;
        ligneBudgetaire: string | null;
        methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
        trimestre: number;
        observations: string | null;
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
                reference: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                ppmId: string;
                objet: string;
                activityId: string | null;
                montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
                sourceFinancement: string | null;
                ligneBudgetaire: string | null;
                methodeProcedure: import(".prisma/client").$Enums.MethodeProcedure;
                trimestre: number;
                observations: string | null;
                dateLancement: Date | null;
                dateAttribution: Date | null;
                dateSignature: Date | null;
                dateExecution: Date | null;
                responsableId: string;
            })[];
        } & {
            id: string;
            reference: string;
            year: number;
            title: string;
            status: import(".prisma/client").$Enums.StatusPPM;
            validatedBy: string | null;
            validatedAt: Date | null;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
            nombreLignes: number;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            projectId: string | null;
        };
    }>;
}
