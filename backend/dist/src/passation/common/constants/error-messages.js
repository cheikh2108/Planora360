"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = void 0;
exports.ERROR_MESSAGES = {
    PPM: {
        DUPLICATE_YEAR: (year) => `Un PPM existe déjà pour l'année ${year}. Chaque organisation ne peut avoir qu'un seul PPM par année. ` +
            `Actions possibles : (1) Modifiez le PPM existant, (2) Supprimez le brouillon existant pour en créer un nouveau, ou (3) Choisissez une année différente.`,
        NOT_FOUND: (id) => `PPM #${id} introuvable`,
        ALREADY_VALIDATED: 'Ce PPM est déjà validé',
        CANNOT_MODIFY_VALIDATED: 'Impossible de modifier un PPM déjà validé',
        NO_LINES: 'Impossible de valider un PPM sans lignes',
        ONLY_DRAFT_CAN_BE_DELETED: 'Seuls les PPM en brouillon peuvent être supprimés',
    },
    DEMANDE: {
        NOT_FOUND: (id) => `Demande #${id} introuvable`,
        CANNOT_MODIFY_APPROVED_OR_REJECTED: 'Impossible de modifier une demande approuvée ou rejetée',
        ONLY_DRAFT_CAN_BE_SUBMITTED: 'Seules les demandes en brouillon peuvent être soumises',
        ONLY_DRAFT_OR_REJECTED_CAN_BE_DELETED: 'Seules les demandes en brouillon ou rejetées peuvent être supprimées',
        NO_PENDING_VALIDATION: 'Aucune validation en attente pour cet utilisateur',
    },
    VALIDATOR: {
        USER_NOT_FOUND: (userId) => `Utilisateur ${userId} introuvable`,
        NO_HIERARCHICAL_VALIDATOR: 'Aucun validateur hiérarchique disponible : ajoutez un membre ayant le droit de valider (autre que le demandeur)',
        NO_TECHNICAL_VALIDATOR: 'Aucun validateur technique disponible : ajoutez un membre ayant le droit de valider (autre que le demandeur)',
        NO_ADMINISTRATIVE_VALIDATOR: 'Aucun validateur administratif disponible : ajoutez un membre ayant le droit de valider (autre que le demandeur)',
    },
    PROCEDURE: {
        NOT_FOUND: 'Procédure introuvable',
        NO_OPENING_DATE: 'Date d\'ouverture non définie pour cette procédure',
    },
    SOUMISSION: {
        CONFIDENTIALITY_BREACH: (date) => `Accès aux soumissions interdit avant le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR')}. ` +
            `Cette mesure garantit la confidentialité et l'intégrité du processus de passation de marchés.`,
    },
};
//# sourceMappingURL=error-messages.js.map