export declare class CreateSoumissionDto {
    fournisseurId: string;
    numeroDepot: string;
    montantTechnique?: number;
    montantFinancier: number;
    montantTotal: number;
    devise?: string;
    conformeAdmin?: boolean;
    conformeTechnique?: boolean;
    conformeFinancier?: boolean;
    horsDelai?: boolean;
    status?: string;
}
