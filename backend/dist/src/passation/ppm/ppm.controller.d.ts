import { PpmService } from './ppm.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
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
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusPPM;
        title: string;
        year: number;
        createdBy: string;
        validatedBy: string | null;
        validatedAt: Date | null;
        projectId: string | null;
    }>;
    findAll(req: any, year?: number, status?: StatusPPM, projectId?: string): Promise<({
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusPPM;
        title: string;
        year: number;
        createdBy: string;
        validatedBy: string | null;
        validatedAt: Date | null;
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
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusPPM;
        title: string;
        year: number;
        createdBy: string;
        validatedBy: string | null;
        validatedAt: Date | null;
        projectId: string | null;
    }>;
    update(id: string, req: any, updatePpmDto: UpdatePpmDto): Promise<{
        project: {
            id: string;
            title: string;
        } | null;
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusPPM;
        title: string;
        year: number;
        createdBy: string;
        validatedBy: string | null;
        validatedAt: Date | null;
        projectId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusPPM;
        title: string;
        year: number;
        createdBy: string;
        validatedBy: string | null;
        validatedAt: Date | null;
        projectId: string | null;
    }>;
    validate(id: string, req: any): Promise<{
        lignes: {
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
        }[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StatusPPM;
        title: string;
        year: number;
        createdBy: string;
        validatedBy: string | null;
        validatedAt: Date | null;
        projectId: string | null;
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
            })[];
        } & {
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.StatusPPM;
            title: string;
            year: number;
            createdBy: string;
            validatedBy: string | null;
            validatedAt: Date | null;
            projectId: string | null;
        };
    }>;
}
