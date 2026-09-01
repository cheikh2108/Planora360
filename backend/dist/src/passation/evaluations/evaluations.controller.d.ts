import { EvaluationsService } from './evaluations.service';
export declare class EvaluationsController {
    private readonly evaluationsService;
    constructor(evaluationsService: EvaluationsService);
    create(procedureId: string, req: any, dto: any): Promise<{
        soumission: {
            fournisseur: {
                id: string;
                raisonSociale: string;
            };
        } & {
            id: string;
            procedureId: string;
            status: string;
            numeroDepot: string;
            fournisseurId: string;
            montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
            montantFinancier: import("@prisma/client-runtime-utils").Decimal;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
            devise: string;
            conformeAdmin: boolean | null;
            conformeTechnique: boolean | null;
            conformeFinancier: boolean | null;
            dateDepot: Date;
            horsDelai: boolean;
        };
        evaluateur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        scoreAdmin: number | null;
        scoreTechnique: number | null;
        scoreFinancier: number | null;
        scoreGlobal: number | null;
        criteres: import("@prisma/client/runtime/client").JsonValue;
        commentaires: string | null;
        validatedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        soumissionId: string;
        commissionId: string;
        evaluateurId: string;
    }>;
    findAll(procedureId: string, req: any): Promise<({
        soumission: {
            fournisseur: {
                id: string;
                raisonSociale: string;
            };
        } & {
            id: string;
            procedureId: string;
            status: string;
            numeroDepot: string;
            fournisseurId: string;
            montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
            montantFinancier: import("@prisma/client-runtime-utils").Decimal;
            montantTotal: import("@prisma/client-runtime-utils").Decimal;
            devise: string;
            conformeAdmin: boolean | null;
            conformeTechnique: boolean | null;
            conformeFinancier: boolean | null;
            dateDepot: Date;
            horsDelai: boolean;
        };
        evaluateur: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        scoreAdmin: number | null;
        scoreTechnique: number | null;
        scoreFinancier: number | null;
        scoreGlobal: number | null;
        criteres: import("@prisma/client/runtime/client").JsonValue;
        commentaires: string | null;
        validatedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        soumissionId: string;
        commissionId: string;
        evaluateurId: string;
    })[]>;
    getSynthese(procedureId: string, req: any): Promise<{
        soumission: any;
        evaluations: any;
        moyenne: number;
        nombreEvaluations: any;
    }[]>;
}
