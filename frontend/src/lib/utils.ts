import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ActivityStatus, Priority, RecommendationStatus, RecommendationPriority, RecommendationSource } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatDateRelative(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `il y a ${Math.abs(diff)} j`;
  if (diff === 0) return "aujourd'hui";
  return `dans ${diff} j`;
}

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  NON_DEMARREE: 'Non démarrée',
  EN_PREPARATION: 'En préparation',
  EN_COURS: 'En cours',
  EN_ATTENTE: 'En attente',
  SUSPENDUE: 'Suspendue',
  TERMINEE: 'Terminée',
  VALIDEE: 'Validée',
  EN_RETARD: 'En retard',
  ANNULEE: 'Annulée',
};

export const STATUS_COLORS: Record<ActivityStatus, string> = {
  NON_DEMARREE: 'bg-slate-100 text-slate-600',
  EN_PREPARATION: 'bg-blue-50 text-blue-700',
  EN_COURS: 'bg-indigo-100 text-indigo-700',
  EN_ATTENTE: 'bg-amber-100 text-amber-700',
  SUSPENDUE: 'bg-orange-100 text-orange-700',
  TERMINEE: 'bg-teal-100 text-teal-700',
  VALIDEE: 'bg-green-100 text-green-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  ANNULEE: 'bg-gray-100 text-gray-500',
};

export const STATUS_DOT: Record<ActivityStatus, string> = {
  NON_DEMARREE: 'bg-slate-400',
  EN_PREPARATION: 'bg-blue-500',
  EN_COURS: 'bg-indigo-500',
  EN_ATTENTE: 'bg-amber-500',
  SUSPENDUE: 'bg-orange-500',
  TERMINEE: 'bg-teal-500',
  VALIDEE: 'bg-green-500',
  EN_RETARD: 'bg-red-500',
  ANNULEE: 'bg-gray-400',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  BASSE: 'Basse',
  NORMALE: 'Normale',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  BASSE: 'text-slate-500',
  NORMALE: 'text-blue-600',
  HAUTE: 'text-amber-600',
  CRITIQUE: 'text-red-600',
};

export const VALIDATION_STEP_LABELS: Record<string, string> = {
  SOUMISSION: 'Soumission',
  VERIFICATION_HIERARCHIQUE: 'Vérification hiérarchique',
  VALIDATION_TECHNIQUE: 'Validation technique',
  VALIDATION_ADMINISTRATIVE: 'Validation administrative',
  CLOTURE: 'Clôture',
};

export const VALIDATION_STEP_INDEX: Record<string, number> = {
  SOUMISSION: 0,
  VERIFICATION_HIERARCHIQUE: 1,
  VALIDATION_TECHNIQUE: 2,
  VALIDATION_ADMINISTRATIVE: 3,
  CLOTURE: 4,
};

// Recommendations
export const RECOMMENDATION_STATUS_LABELS: Record<RecommendationStatus, string> = {
  NON_DEMARREE: 'Non démarrée',
  EN_COURS: 'En cours',
  PARTIELLEMENT_MISE_EN_OEUVRE: 'Partiellement mise en œuvre',
  REALISEE_A_VALIDER: 'Réalisée - À valider',
  EN_RETARD: 'En retard',
  SUSPENDUE: 'Suspendue',
  VALIDEE: 'Validée',
  ROUVERTE: 'Réouverte',
};

export const RECOMMENDATION_STATUS_COLORS: Record<RecommendationStatus, string> = {
  NON_DEMARREE: 'bg-slate-100 text-slate-600',
  EN_COURS: 'bg-blue-100 text-blue-700',
  PARTIELLEMENT_MISE_EN_OEUVRE: 'bg-indigo-100 text-indigo-700',
  REALISEE_A_VALIDER: 'bg-purple-100 text-purple-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  SUSPENDUE: 'bg-orange-100 text-orange-700',
  VALIDEE: 'bg-green-100 text-green-700',
  ROUVERTE: 'bg-amber-100 text-amber-700',
};

export const RECOMMENDATION_STATUS_DOT: Record<RecommendationStatus, string> = {
  NON_DEMARREE: 'bg-slate-400',
  EN_COURS: 'bg-blue-500',
  PARTIELLEMENT_MISE_EN_OEUVRE: 'bg-indigo-500',
  REALISEE_A_VALIDER: 'bg-purple-500',
  EN_RETARD: 'bg-red-500',
  SUSPENDUE: 'bg-orange-500',
  VALIDEE: 'bg-green-500',
  ROUVERTE: 'bg-amber-500',
};

export const RECOMMENDATION_PRIORITY_LABELS: Record<RecommendationPriority, string> = {
  FAIBLE: 'Faible',
  MOYENNE: 'Moyenne',
  ELEVEE: 'Élevée',
  CRITIQUE: 'Critique',
};

export const RECOMMENDATION_PRIORITY_COLORS: Record<RecommendationPriority, string> = {
  FAIBLE: 'text-slate-500',
  MOYENNE: 'text-blue-600',
  ELEVEE: 'text-amber-600',
  CRITIQUE: 'text-red-600',
};

export const RECOMMENDATION_SOURCE_LABELS: Record<RecommendationSource, string> = {
  MISSION_SUPERVISION: 'Mission de supervision',
  VISITE_TERRAIN: 'Visite de terrain',
  AUDIT_INTERNE: 'Audit interne',
  AUDIT_EXTERNE: 'Audit externe',
  EVALUATION_PROJET: 'Évaluation de projet',
  EVALUATION_PROGRAMME: 'Évaluation de programme',
  REUNION_COORDINATION: 'Réunion de coordination',
  REVUE_PERFORMANCE: 'Revue de performance',
  CONTROLE_INTERNE: 'Contrôle interne',
  CONTROLE_QUALITE: 'Contrôle qualité',
  REVUE_BUDGETAIRE: 'Revue budgétaire',
  REVUE_FINANCIERE: 'Revue financière',
  OBSERVATION_BAILLEUR: 'Observation bailleur',
  OBSERVATION_PARTENAIRE: 'Observation partenaire',
  REVUE_GOUVERNANCE: 'Revue gouvernance',
  INSPECTION: 'Inspection',
  REVUE_DOCUMENTAIRE: 'Revue documentaire',
  VERIFICATION_CONFORMITE: 'Vérification conformité',
  AUTRE: 'Autre',
};
