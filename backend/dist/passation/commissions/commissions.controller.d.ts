import { CommissionsService } from './commissions.service';
import { CreateCommissionDto, AddMembreDto } from './dto/create-commission.dto';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    create(req: any, dto: CreateCommissionDto): Promise<{
        procedure: {
            id: string;
            objet: string;
            reference: string;
        };
        president: {
            id: string;
            firstName: string;
            lastName: string;
        };
        membres: {
            role: string;
            id: string;
            userId: string;
            commissionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        type: string;
        procedureId: string;
        nom: string;
        dateSeance: Date;
        presidentId: string;
    }>;
    findAll(req: any): Promise<({
        procedure: {
            id: string;
            objet: string;
            reference: string;
        };
        _count: {
            evaluations: number;
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
            role: string;
            id: string;
            userId: string;
            commissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        type: string;
        procedureId: string;
        nom: string;
        dateSeance: Date;
        presidentId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        procedure: {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.StatusProcedure;
            description: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
            reference: string;
            dateAttribution: Date | null;
            responsableId: string;
            lignePPMId: string | null;
            demandeAchatId: string | null;
            methode: import(".prisma/client").$Enums.MethodeProcedure;
            datePublication: Date | null;
            dateLimite: Date | null;
            dateOuverture: Date | null;
            dateClarification: Date | null;
        };
        evaluations: ({
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
        })[];
        president: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
        membres: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            role: string;
            id: string;
            userId: string;
            commissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        type: string;
        procedureId: string;
        nom: string;
        dateSeance: Date;
        presidentId: string;
    }>;
    addMembre(id: string, req: any, dto: AddMembreDto): Promise<{
        user: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        role: string;
        id: string;
        userId: string;
        commissionId: string;
    }>;
    removeMembre(id: string, membreId: string, req: any): Promise<{
        role: string;
        id: string;
        userId: string;
        commissionId: string;
    }>;
}
