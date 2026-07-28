import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ActivityStatus, Priority } from './types';

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
