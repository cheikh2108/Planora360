import { StatusFournisseur } from '@prisma/client';
export declare class CreateFournisseurDto {
    raisonSociale: string;
    identifiantFiscal?: string;
    registreCommerce?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    telephone?: string;
    email?: string;
    nomContact?: string;
    domainesActivite?: string[];
    status?: StatusFournisseur;
}
