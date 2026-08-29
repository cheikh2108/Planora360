import { PrismaService } from '../../common/prisma/prisma.service';
export declare class SoumissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(procedureId: string, fournisseurId: string, userId: string, dto: any): Promise<{
        fournisseur: {
            id: string;
            raisonSociale: string;
            identifiantFiscal: string | null;
        };
        documents: {
            url: string;
            id: string;
            fileSize: number | null;
            type: string;
            uploadedAt: Date;
            nom: string;
            soumissionId: string;
        }[];
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
    }>;
    findAll(procedureId: string, organizationId: string): Promise<({
        fournisseur: {
            id: string;
            email: string | null;
            raisonSociale: string;
            identifiantFiscal: string | null;
        };
        documents: {
            url: string;
            id: string;
            nom: string;
        }[];
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
    })[]>;
    findOne(id: string, procedureId: string, organizationId: string): Promise<{
        fournisseur: {
            id: string;
            email: string | null;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.StatusFournisseur;
            raisonSociale: string;
            identifiantFiscal: string | null;
            registreCommerce: string | null;
            adresse: string | null;
            ville: string | null;
            pays: string;
            telephone: string | null;
            nomContact: string | null;
            domainesActivite: string[];
            siteWeb: string | null;
            prenomContact: string | null;
            fonctionContact: string | null;
            telephoneContact: string | null;
            emailContact: string | null;
            categoriesBiens: string[];
            zonesIntervention: string[];
        };
        procedure: {
            id: string;
            reference: string;
            objet: string;
            dateOuverture: Date | null;
        };
        documents: {
            url: string;
            id: string;
            fileSize: number | null;
            type: string;
            uploadedAt: Date;
            nom: string;
            soumissionId: string;
        }[];
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
    }>;
}
