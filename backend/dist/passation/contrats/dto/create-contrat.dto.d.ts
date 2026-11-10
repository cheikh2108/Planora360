export declare class CreateContratDto {
    procedureId: string;
    fournisseurId: string;
    montantInitial: number;
    dateSignature: string;
    dateEcheance: string;
    soumissionId?: string;
    montantRevise?: number;
    dateDemarrage?: string;
    dateReceptionProv?: string;
    dateReceptionDef?: string;
    modalitesAvance?: string;
    modalitesAcompte?: string;
    modalitesRetenue?: string;
    garanties?: string;
    devise?: string;
}
