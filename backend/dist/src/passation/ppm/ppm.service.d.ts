import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePpmDto } from './dto/create-ppm.dto';
import { UpdatePpmDto } from './dto/update-ppm.dto';
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
    update(id: string, organizationId: string, dto: UpdatePpmDto): Promise<{
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
    remove(id: string, organizationId: string): Promise<{
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
    validate(id: string, organizationId: string, userId: string): Promise<{
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
