/**
 * Types TypeScript pour le module Passation de Marchés
 * Alignés avec le backend Prisma schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type MethodeProcedure =
  | 'APPEL_OFFRES_OUVERT'
  | 'APPEL_OFFRES_RESTREINT'
  | 'CONSULTATION'
  | 'GRE_A_GRE';

export type StatusPPM =
  | 'BROUILLON'
  | 'EN_REVISION'
  | 'VALIDE'
  | 'PUBLIE'
  | 'ARCHIVE';

export type StatusDemandeAchat =
  | 'BROUILLON'
  | 'SOUMISE'
  | 'EN_VALIDATION_HIERARCHIQUE'
  | 'EN_VALIDATION_TECHNIQUE'
  | 'EN_VALIDATION_ADMINISTRATIVE'
  | 'VALIDEE'
  | 'REJETEE'
  | 'ANNULEE';

export type StatusProcedure =
  | 'BROUILLON'
  | 'PUBLIEE'
  | 'EN_COURS'
  | 'CLOTUREE_OFFRES'
  | 'EVALUATION'
  | 'ATTRIBUEE'
  | 'INFRUCTUEUSE'
  | 'ANNULEE';

export type StatusContrat =
  | 'SIGNE'
  | 'EN_COURS'
  | 'SUSPENDU'
  | 'RESILIE'
  | 'TERMINE'
  | 'ARCHIVE';

export type StatusFournisseur =
  | 'A_VALIDER'
  | 'ACTIF'
  | 'SUSPENDU'
  | 'BLACKLISTE'
  | 'ARCHIVE';

// ============================================================================
// PLAN PASSATION DES MARCHÉS (PPM)
// ============================================================================

export interface LignePPM {
  id: string;
  ppmId: string;
  reference: string;
  objetMarche: string;
  montantEstime: number | string;
  methode: MethodeProcedure;
  trimestre: number;
  responsableId: string | null;
  responsable?: { id: string; firstName: string; lastName: string };
  activityId: string | null;
  activity?: { id: string; title: string };
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanPassationMarche {
  id: string;
  organizationId: string;
  reference: string;
  year: number;
  projectId: string | null;
  project?: { id: string; title: string };
  status: StatusPPM;
  montantTotal: number | string;
  nombreLignes: number;
  createdBy: string;
  validatedBy?: string | null;
  validatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lignes?: LignePPM[];
}

// ============================================================================
// DEMANDES D'ACHAT
// ============================================================================

export interface ValidationDemande {
  id: string;
  demandeId: string;
  etape: string;
  ordre: number;
  validateurId: string;
  validateur?: { id: string; firstName: string; lastName: string; email: string };
  decision: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  commentaire?: string | null;
  validatedAt?: string | null;
  createdAt: string;
}

export interface DemandeAchat {
  id: string;
  organizationId: string;
  reference: string;
  demandeurId: string;
  demandeur?: { id: string; firstName: string; lastName: string; email: string };
  lignePpmId: string | null;
  lignePpm?: LignePPM;
  objet: string;
  justification: string;
  montantEstime: number | string;
  dateNecessite: string;
  status: StatusDemandeAchat;
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  documentsJustificatifs?: any[];
  createdAt: string;
  updatedAt: string;
  validations?: ValidationDemande[];
}

// ============================================================================
// FOURNISSEURS
// ============================================================================

export interface FournisseurDocument {
  id: string;
  fournisseurId: string;
  type: string;
  nom: string;
  url: string;
  dateExpiration?: string | null;
  uploadedAt: string;
}

export interface EvaluationFournisseur {
  id: string;
  fournisseurId: string;
  contratId: string | null;
  evaluateurId: string;
  evaluateur?: { id: string; firstName: string; lastName: string };
  noteQualite?: number | null;
  noteDelai?: number | null;
  noteConformite?: number | null;
  noteGlobale: number;
  commentaire?: string | null;
  createdAt: string;
}

export interface Fournisseur {
  id: string;
  organizationId: string;
  reference: string;
  raisonSociale: string;
  identifiantFiscal?: string | null;
  registreCommerce?: string | null;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  telephone?: string | null;
  email?: string | null;
  nomContact?: string | null;
  domainesActivite: string[];
  status: StatusFournisseur;
  remarques?: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: FournisseurDocument[];
  evaluations?: EvaluationFournisseur[];
  soumissions?: any[];
  contrats?: any[];
  _count?: {
    soumissions: number;
    evaluations: number;
    contrats: number;
  };
}

// ============================================================================
// PROCÉDURES
// ============================================================================

export interface Procedure {
  id: string;
  organizationId: string;
  reference: string;
  lignePpmId: string | null;
  lignePpm?: LignePPM;
  objet: string;
  methode: MethodeProcedure;
  montantEstime: number | string;
  status: StatusProcedure;
  cahierCharges?: string | null;
  datePublication?: string | null;
  dateLimite?: string | null;
  dateOuverture?: string | null;
  createdAt: string;
  updatedAt: string;
  soumissions?: Soumission[];
  commissions?: Commission[];
  contrat?: any;
  _count?: {
    soumissions: number;
  };
}

// ============================================================================
// SOUMISSIONS
// ============================================================================

export interface SoumissionDocument {
  id: string;
  soumissionId: string;
  type: string;
  nom: string;
  url: string;
  uploadedAt: string;
}

export interface Soumission {
  id: string;
  procedureId: string;
  procedure?: Procedure;
  fournisseurId: string;
  fournisseur?: Fournisseur;
  montantPropose: number | string;
  delaiExecution: number;
  validiteOffre: number;
  garantieSoumission?: number | string | null;
  observations?: string | null;
  dateDepot: string;
  documents?: SoumissionDocument[];
  evaluations?: Evaluation[];
  contrat?: any;
}

// ============================================================================
// COMMISSIONS
// ============================================================================

export interface MembreCommission {
  id: string;
  commissionId: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  role: string;
  createdAt: string;
}

export interface Commission {
  id: string;
  procedureId: string;
  procedure?: Procedure;
  nom: string;
  presidentId: string;
  president?: { id: string; firstName: string; lastName: string; email: string };
  dateCreation: string;
  membres?: MembreCommission[];
  evaluations?: Evaluation[];
  _count?: {
    membres: number;
    evaluations: number;
  };
}

// ============================================================================
// ÉVALUATIONS
// ============================================================================

export interface Evaluation {
  id: string;
  soumissionId: string;
  soumission?: Soumission;
  commissionId: string;
  commission?: Commission;
  evaluateurId: string;
  evaluateur?: { id: string; firstName: string; lastName: string };
  scoreAdmin?: number | null;
  scoreTechnique?: number | null;
  scoreFinancier?: number | null;
  scoreGlobal?: number | null;
  criteres: any; // JSON
  commentaires?: string | null;
  validatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyntheseEvaluation {
  soumission: Soumission;
  evaluations: Evaluation[];
  moyenne: number;
  nombreEvaluations: number;
}

// ============================================================================
// CONTRATS
// ============================================================================

export interface Avenant {
  id: string;
  contratId: string;
  numero: number;
  objet: string;
  montantImpact: number | string;
  dateSignature: string;
  justification: string;
  createdAt: string;
}

export interface Livrable {
  id: string;
  contratId: string;
  titre: string;
  description?: string | null;
  dateEcheance: string;
  responsableId?: string | null;
  responsable?: { id: string; firstName: string; lastName: string };
  status: string;
  ordre: number;
  createdAt: string;
  updatedAt: string;
  receptions?: any[];
}

export interface PaiementContrat {
  id: string;
  contratId: string;
  type: string;
  montantBrut: number | string;
  taxes: number | string;
  penalites: number | string;
  montantNet: number | string;
  dateEcheance?: string | null;
  datePaiement?: string | null;
  status: string;
  referenceComptable?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contrat {
  id: string;
  organizationId: string;
  reference: string;
  procedureId: string;
  procedure?: Procedure;
  soumissionId: string;
  soumission?: Soumission;
  fournisseurId: string;
  fournisseur?: Fournisseur;
  montantInitial: number | string;
  montantRevise?: number | string | null;
  montantPaye: number | string;
  devise: string;
  dateSignature: string;
  dateDemarrage?: string | null;
  dateEcheance: string;
  dateReceptionProv?: string | null;
  dateReceptionDef?: string | null;
  modalitesAvance?: string | null;
  modalitesAcompte?: string | null;
  modalitesRetenue?: string | null;
  garanties?: string | null;
  gestionnaire: string;
  gestionnaireUser?: { id: string; firstName: string; lastName: string; email: string };
  status: StatusContrat;
  createdAt: string;
  updatedAt: string;
  avenants?: Avenant[];
  livrables?: Livrable[];
  paiements?: PaiementContrat[];
  _count?: {
    avenants: number;
    livrables: number;
    paiements: number;
  };
}

export interface ContratDashboard {
  contrat: {
    id: string;
    reference: string;
    montantInitial: number | string;
    montantRevise?: number | string | null;
    status: StatusContrat;
    dateSignature: string;
    dateDemarrage?: string | null;
    dateEcheance: string;
  };
  fournisseur: Fournisseur;
  statistiques: {
    montantTotal: number;
    montantPaye: number;
    tauxExecution: number;
    nombreLivrables: number;
    livrablesReceptionnes: number;
    nombrePaiements: number;
    paiementsEffectues: number;
    nombreAvenants: number;
  };
}
