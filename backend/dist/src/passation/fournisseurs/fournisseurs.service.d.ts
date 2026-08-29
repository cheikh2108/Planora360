import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { StatusFournisseur } from '@prisma/client';
export declare class FournisseursService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(organizationId: string, dto: CreateFournisseurDto): Promise<{
        documents: {
            url: string;
            id: string;
            fileSize: number | null;
            type: string;
            mimeType: string | null;
            uploadedAt: Date;
            fournisseurId: string;
            nom: string;
            dateExpiration: Date | null;
        }[];
    } & {
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
    }>;
    findAll(organizationId: string, filters?: {
        status?: StatusFournisseur;
        search?: string;
    }): Promise<({
        _count: {
            evaluations: number;
            soumissions: number;
        };
        documents: {
            id: string;
            type: string;
            nom: string;
            dateExpiration: Date | null;
        }[];
    } & {
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
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        evaluations: ({
            evaluateur: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            fournisseurId: string;
            commentaires: string | null;
            evaluateurId: string;
            contratId: string | null;
            qualite: number | null;
            delais: number | null;
            conformite: number | null;
            disponibilite: number | null;
            serviceAV: number | null;
            respectContractuel: number | null;
            rapportQualitePrix: number | null;
            noteGlobale: number;
        })[];
        documents: {
            url: string;
            id: string;
            fileSize: number | null;
            type: string;
            mimeType: string | null;
            uploadedAt: Date;
            fournisseurId: string;
            nom: string;
            dateExpiration: Date | null;
        }[];
        soumissions: ({
            procedure: {
                id: string;
                reference: string;
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
        })[];
        contrats: {
            id: string;
            status: import(".prisma/client").$Enums.StatusContrat;
            reference: string;
            montantInitial: import("@prisma/client-runtime-utils").Decimal;
            montantRevise: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
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
    }>;
    update(id: string, organizationId: string, dto: UpdateFournisseurDto): Promise<{
        documents: {
            url: string;
            id: string;
            fileSize: number | null;
            type: string;
            mimeType: string | null;
            uploadedAt: Date;
            fournisseurId: string;
            nom: string;
            dateExpiration: Date | null;
        }[];
    } & {
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
    }>;
    remove(id: string, organizationId: string): Promise<{
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
    }>;
    changeStatus(id: string, organizationId: string, newStatus: StatusFournisseur, motif?: string): Promise<{
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
    }>;
    addDocument(fournisseurId: string, organizationId: string, documentData: {
        type: string;
        nom: string;
        url: string;
        dateExpiration?: Date;
    }): Promise<{
        url: string;
        id: string;
        fileSize: number | null;
        type: string;
        mimeType: string | null;
        uploadedAt: Date;
        fournisseurId: string;
        nom: string;
        dateExpiration: Date | null;
    }>;
    removeDocument(fournisseurId: string, documentId: string, organizationId: string): Promise<{
        url: string;
        id: string;
        fileSize: number | null;
        type: string;
        mimeType: string | null;
        uploadedAt: Date;
        fournisseurId: string;
        nom: string;
        dateExpiration: Date | null;
    }>;
}
