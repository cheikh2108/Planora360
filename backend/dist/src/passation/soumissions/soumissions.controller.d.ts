import { SoumissionsService } from './soumissions.service';
export declare class SoumissionsController {
    private readonly soumissionsService;
    constructor(soumissionsService: SoumissionsService);
    create(procedureId: string, req: any, dto: any): Promise<{
        fournisseur: {
            id: string;
            raisonSociale: string;
            identifiantFiscal: string | null;
        };
        documents: {
            id: string;
            soumissionId: string;
            type: string;
            nom: string;
            url: string;
            fileSize: number | null;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        numeroDepot: string;
        montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
        montantFinancier: import("@prisma/client-runtime-utils").Decimal;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        devise: string;
        conformeAdmin: boolean | null;
        conformeTechnique: boolean | null;
        conformeFinancier: boolean | null;
        dateDepot: Date;
        horsDelai: boolean;
        status: string;
        procedureId: string;
        fournisseurId: string;
    }>;
    findAll(procedureId: string, req: any): Promise<({
        fournisseur: {
            id: string;
            raisonSociale: string;
            identifiantFiscal: string | null;
            email: string | null;
        };
        documents: {
            id: string;
            nom: string;
            url: string;
        }[];
    } & {
        id: string;
        numeroDepot: string;
        montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
        montantFinancier: import("@prisma/client-runtime-utils").Decimal;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        devise: string;
        conformeAdmin: boolean | null;
        conformeTechnique: boolean | null;
        conformeFinancier: boolean | null;
        dateDepot: Date;
        horsDelai: boolean;
        status: string;
        procedureId: string;
        fournisseurId: string;
    })[]>;
    findOne(procedureId: string, id: string, req: any): Promise<{
        procedure: {
            id: string;
            reference: string;
            objet: string;
            dateOuverture: Date | null;
        };
        fournisseur: {
            id: string;
            status: import(".prisma/client").$Enums.StatusFournisseur;
            organizationId: string;
            raisonSociale: string;
            identifiantFiscal: string | null;
            registreCommerce: string | null;
            adresse: string | null;
            ville: string | null;
            pays: string;
            telephone: string | null;
            email: string | null;
            siteWeb: string | null;
            nomContact: string | null;
            prenomContact: string | null;
            fonctionContact: string | null;
            telephoneContact: string | null;
            emailContact: string | null;
            domainesActivite: string[];
            categoriesBiens: string[];
            zonesIntervention: string[];
            createdAt: Date;
            updatedAt: Date;
        };
        documents: {
            id: string;
            soumissionId: string;
            type: string;
            nom: string;
            url: string;
            fileSize: number | null;
            uploadedAt: Date;
        }[];
    } & {
        id: string;
        numeroDepot: string;
        montantTechnique: import("@prisma/client-runtime-utils").Decimal | null;
        montantFinancier: import("@prisma/client-runtime-utils").Decimal;
        montantTotal: import("@prisma/client-runtime-utils").Decimal;
        devise: string;
        conformeAdmin: boolean | null;
        conformeTechnique: boolean | null;
        conformeFinancier: boolean | null;
        dateDepot: Date;
        horsDelai: boolean;
        status: string;
        procedureId: string;
        fournisseurId: string;
    }>;
}
