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
            id: string;
            role: string;
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
        _count: {
            evaluations: number;
        };
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
        membres: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            role: string;
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
        procedure: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
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
            id: string;
            role: string;
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
        id: string;
        role: string;
        userId: string;
        commissionId: string;
    }>;
    removeMembre(id: string, membreId: string, req: any): Promise<{
        id: string;
        role: string;
        userId: string;
        commissionId: string;
    }>;
}
