import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
export declare class EvaluationsController {
    private readonly evaluationsService;
    constructor(evaluationsService: EvaluationsService);
    create(procedureId: string, req: any, dto: CreateEvaluationDto): Promise<{
        soumission: {
            fournisseur: {
                id: string;
                raisonSociale: string;
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
    findAll(procedureId: string, req: any): Promise<({
        soumission: {
            fournisseur: {
                id: string;
                raisonSociale: string;
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
    getSynthese(procedureId: string, req: any): Promise<{
        soumission: any;
        evaluations: any;
        moyenne: number;
        nombreEvaluations: any;
    }[]>;
}
