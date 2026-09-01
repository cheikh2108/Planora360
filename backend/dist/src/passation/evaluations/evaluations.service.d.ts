import { PrismaService } from '../../common/prisma/prisma.service';
export declare class EvaluationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(procedureId: string, userId: string, dto: any): Promise<{
        soumission: {
            fournisseur: {
                id: string;
                raisonSociale: string;
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
        };
        evaluateur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        validatedAt: Date | null;
        soumissionId: string;
        commentaires: string | null;
        evaluateurId: string;
        commissionId: string;
        scoreAdmin: number | null;
        scoreTechnique: number | null;
        scoreFinancier: number | null;
        scoreGlobal: number | null;
        criteres: import("@prisma/client/runtime/client").JsonValue;
    }>;
    findAll(procedureId: string, organizationId: string): Promise<({
        soumission: {
            fournisseur: {
                id: string;
                raisonSociale: string;
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
        };
        evaluateur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        validatedAt: Date | null;
        soumissionId: string;
        commentaires: string | null;
        evaluateurId: string;
        commissionId: string;
        scoreAdmin: number | null;
        scoreTechnique: number | null;
        scoreFinancier: number | null;
        scoreGlobal: number | null;
        criteres: import("@prisma/client/runtime/client").JsonValue;
    })[]>;
    getSynthese(procedureId: string, organizationId: string): Promise<{
        soumission: any;
        evaluations: any;
        moyenne: number;
        nombreEvaluations: any;
    }[]>;
}
