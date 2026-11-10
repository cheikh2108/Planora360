export declare class CreateCommissionDto {
    procedureId: string;
    nom: string;
    type: string;
    dateSeance: string;
    presidentId?: string;
}
export declare const MEMBRE_ROLES: string[];
export declare class AddMembreDto {
    userId: string;
    role: string;
}
