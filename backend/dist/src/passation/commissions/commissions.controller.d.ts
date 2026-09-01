import { CommissionsService } from './commissions.service';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    create(req: any, dto: any): Promise<{
        procedure: {
            id: string;
            reference: string;
            objet: string;
        };
        president: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        nom: string;
        type: string;
        dateSeance: Date;
        createdAt: Date;
        procedureId: string;
        presidentId: string;
    }>;
    findAll(req: any): Promise<({
        procedure: {
            id: string;
            reference: string;
            objet: string;
        };
        president: {
            id: string;
            firstName: string;
            lastName: string;
        };
        membres: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            role: string;
            commissionId: string;
            userId: string;
        })[];
        _count: {
            evaluations: number;
        };
    } & {
        id: string;
        nom: string;
        type: string;
        dateSeance: Date;
        createdAt: Date;
        procedureId: string;
        presidentId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        procedure: {
            id: string;
            createdAt: Date;
            organizationId: string;
            updatedAt: Date;
            reference: string;
            demandeAchatId: string | null;
            lignePPMId: string | null;
            methode: import(".prisma/client").$Enums.MethodeProcedure;
            objet: string;
            description: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            datePublication: Date | null;
            dateLimite: Date | null;
            dateOuverture: Date | null;
            dateClarification: Date | null;
            dateAttribution: Date | null;
            responsableId: string;
            status: import(".prisma/client").$Enums.StatusProcedure;
        };
        president: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        membres: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            role: string;
            commissionId: string;
            userId: string;
        })[];
        evaluations: ({
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
            createdAt: Date;
            updatedAt: Date;
            commissionId: string;
            soumissionId: string;
            evaluateurId: string;
            scoreAdmin: number | null;
            scoreTechnique: number | null;
            scoreFinancier: number | null;
            scoreGlobal: number | null;
            criteres: import("@prisma/client/runtime/client").JsonValue;
            commentaires: string | null;
            validatedAt: Date | null;
        })[];
    } & {
        id: string;
        nom: string;
        type: string;
        dateSeance: Date;
        createdAt: Date;
        procedureId: string;
        presidentId: string;
    }>;
    addMembre(id: string, req: any, userId: string, role: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        role: string;
        commissionId: string;
        userId: string;
    }>;
    removeMembre(id: string, membreId: string, req: any): Promise<{
        id: string;
        role: string;
        commissionId: string;
        userId: string;
    }>;
}
