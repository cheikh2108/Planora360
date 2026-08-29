import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CommissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(organizationId: string, userId: string, dto: any): Promise<{
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
        createdAt: Date;
        type: string;
        nom: string;
        procedureId: string;
        dateSeance: Date;
        presidentId: string;
    }>;
    findAll(organizationId: string): Promise<({
        _count: {
            evaluations: number;
        };
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
            userId: string;
            commissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        type: string;
        nom: string;
        procedureId: string;
        dateSeance: Date;
        presidentId: string;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        evaluations: ({
            soumission: {
                fournisseur: {
                    id: string;
                    raisonSociale: string;
                };
            } & {
                id: string;
                status: string;
                fournisseurId: string;
                dateDepot: Date;
                procedureId: string;
                devise: string;
                numeroDepot: string;
                montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
                montantFinancier: import("@prisma/client-runtime-utils").Decimal;
                montantTotal: import("@prisma/client-runtime-utils").Decimal;
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
            commissionId: string;
            scoreAdmin: number | null;
            scoreTechnique: number | null;
            scoreFinancier: number | null;
            scoreGlobal: number | null;
            criteres: import("@prisma/client/runtime/client").JsonValue;
            commentaires: string | null;
            evaluateurId: string;
        })[];
        procedure: {
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.StatusProcedure;
            description: string;
            reference: string;
            objet: string;
            montantEstimatif: import("@prisma/client-runtime-utils").Decimal;
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
            userId: string;
            commissionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        type: string;
        nom: string;
        procedureId: string;
        dateSeance: Date;
        presidentId: string;
    }>;
    addMembre(commissionId: string, organizationId: string, userId: string, role: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        role: string;
        userId: string;
        commissionId: string;
    }>;
    removeMembre(commissionId: string, membreId: string, organizationId: string): Promise<{
        id: string;
        role: string;
        userId: string;
        commissionId: string;
    }>;
}
