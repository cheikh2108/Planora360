export declare const ERROR_MESSAGES: {
    readonly PPM: {
        readonly DUPLICATE_YEAR: (year: number) => string;
        readonly NOT_FOUND: (id: string) => string;
        readonly ALREADY_VALIDATED: "Ce PPM est déjà validé";
        readonly CANNOT_MODIFY_VALIDATED: "Impossible de modifier un PPM déjà validé";
        readonly NO_LINES: "Impossible de valider un PPM sans lignes";
        readonly ONLY_DRAFT_CAN_BE_DELETED: "Seuls les PPM en brouillon peuvent être supprimés";
    };
    readonly DEMANDE: {
        readonly NOT_FOUND: (id: string) => string;
        readonly CANNOT_MODIFY_APPROVED_OR_REJECTED: "Impossible de modifier une demande approuvée ou rejetée";
        readonly ONLY_DRAFT_CAN_BE_SUBMITTED: "Seules les demandes en brouillon peuvent être soumises";
        readonly ONLY_DRAFT_OR_REJECTED_CAN_BE_DELETED: "Seules les demandes en brouillon ou rejetées peuvent être supprimées";
        readonly NO_PENDING_VALIDATION: "Aucune validation en attente pour cet utilisateur";
    };
    readonly VALIDATOR: {
        readonly USER_NOT_FOUND: (userId: string) => string;
        readonly NO_TECHNICAL_VALIDATOR: (orgId: string) => string;
        readonly NO_ADMINISTRATIVE_VALIDATOR: (orgId: string) => string;
    };
    readonly PROCEDURE: {
        readonly NOT_FOUND: "Procédure introuvable";
        readonly NO_OPENING_DATE: "Date d'ouverture non définie pour cette procédure";
    };
    readonly SOUMISSION: {
        readonly CONFIDENTIALITY_BREACH: (date: Date) => string;
    };
};
