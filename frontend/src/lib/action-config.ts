/**
 * Configuration des actions pour le journal d'activité
 * Utilisé dans notifications-dropdown et page /notifications
 */

import {
  Bell, CheckCircle2, XCircle, Upload, UserPlus, Edit3,
  AlertTriangle, GitBranch, Send, Shield, CheckCheck,
  PlayCircle, PauseCircle, RotateCcw, Trash2, ShieldAlert,
  FileText, MessageSquare, ListTodo, Target, Clock,
  DollarSign, Archive, Plus, Wallet, FileUp,
} from 'lucide-react';

export const ACTION_CONFIG: Record<string, { icon: React.ElementType; badge: string; dot: string; label: string }> = {
  // Validations
  SUBMIT:                { icon: Send,         badge: 'bg-blue-500/15 text-blue-400',     dot: 'bg-blue-500',    label: 'Soumission' },
  'validation.submitted':{ icon: Send,         badge: 'bg-blue-500/15 text-blue-400',     dot: 'bg-blue-500',    label: 'Soumission validation' },
  APPROVE:               { icon: CheckCircle2, badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Approuvé' },
  'validation.approuve': { icon: CheckCircle2, badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Validation approuvée' },
  REJECT:                { icon: XCircle,      badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Rejeté' },
  'validation.rejete':   { icon: XCircle,      badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Validation rejetée' },
  VALIDATE:              { icon: GitBranch,    badge: 'bg-teal-500/15 text-teal-400',     dot: 'bg-teal-500',    label: 'Validé' },

  // Documents
  UPLOAD:                { icon: Upload,       badge: 'bg-purple-500/15 text-purple-400', dot: 'bg-purple-500',  label: 'Document ajouté' },
  UPLOAD_DOCUMENT:       { icon: FileUp,       badge: 'bg-purple-500/15 text-purple-400', dot: 'bg-purple-500',  label: 'Document téléversé' },
  DELETE_DOCUMENT:       { icon: Trash2,       badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Document supprimé' },

  // Users
  CREATE_USER:           { icon: UserPlus,     badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Utilisateur créé' },
  UPDATE_USER:           { icon: Edit3,        badge: 'bg-slate-500/15 text-slate-400',   dot: 'bg-slate-400',   label: 'Utilisateur modifié' },
  DELETE_USER:           { icon: Trash2,       badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Utilisateur supprimé' },

  // Generic CRUD
  CREATE:                { icon: Plus,         badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Création' },
  UPDATE:                { icon: Edit3,        badge: 'bg-slate-500/15 text-slate-400',   dot: 'bg-slate-400',   label: 'Mise à jour' },
  DELETE:                { icon: Trash2,       badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Suppression' },

  // Status changes
  STATUS_CHANGE:         { icon: AlertTriangle,badge: 'bg-amber-500/15 text-amber-400',   dot: 'bg-amber-400',   label: 'Changement de statut' },
  START:                 { icon: PlayCircle,   badge: 'bg-green-500/15 text-green-400',   dot: 'bg-green-500',   label: 'Démarrage' },
  SUSPEND:               { icon: PauseCircle,  badge: 'bg-orange-500/15 text-orange-400', dot: 'bg-orange-500',  label: 'Suspension' },
  REOPEN:                { icon: RotateCcw,    badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Réouverture' },
  COMPLETE:              { icon: CheckCheck,   badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Terminé' },
  CLOSE:                 { icon: Archive,      badge: 'bg-slate-500/15 text-slate-400',   dot: 'bg-slate-400',   label: 'Clôture' },

  // Recommandations
  'recommendation.create':     { icon: ShieldAlert, badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Recommandation créée' },
  'recommendation.update':     { icon: Edit3,       badge: 'bg-slate-500/15 text-slate-400',   dot: 'bg-slate-400',   label: 'Recommandation modifiée' },
  'recommendation.delete':     { icon: Trash2,      badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Recommandation supprimée' },
  'recommendation.start':      { icon: PlayCircle,  badge: 'bg-green-500/15 text-green-400',   dot: 'bg-green-500',   label: 'Recommandation démarrée' },
  'recommendation.suspend':    { icon: PauseCircle, badge: 'bg-orange-500/15 text-orange-400', dot: 'bg-orange-500',  label: 'Recommandation suspendue' },
  'recommendation.reopen':     { icon: RotateCcw,   badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Recommandation rouverte' },
  'recommendation.validate':   { icon: CheckCheck,  badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Recommandation validée' },
  'recommendation.progress':   { icon: Target,      badge: 'bg-blue-500/15 text-blue-400',     dot: 'bg-blue-500',    label: 'Progression mise à jour' },
  'recommendation.action.add': { icon: ListTodo,    badge: 'bg-purple-500/15 text-purple-400', dot: 'bg-purple-500',  label: 'Action ajoutée' },
  'recommendation.action.delete': { icon: Trash2,   badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Action supprimée' },
  'recommendation.comment.add':{ icon: MessageSquare, badge: 'bg-teal-500/15 text-teal-400',  dot: 'bg-teal-500',    label: 'Commentaire ajouté' },

  // Activities
  'activity.create':     { icon: Plus,         badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Activité créée' },
  'activity.update':     { icon: Edit3,        badge: 'bg-slate-500/15 text-slate-400',   dot: 'bg-slate-400',   label: 'Activité modifiée' },
  'activity.delete':     { icon: Trash2,       badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Activité supprimée' },
  'activity.status':     { icon: AlertTriangle,badge: 'bg-amber-500/15 text-amber-400',   dot: 'bg-amber-400',   label: 'Statut activité changé' },

  // Plans
  'plan.create':         { icon: FileText,     badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Plan créé' },
  'plan.update':         { icon: Edit3,        badge: 'bg-slate-500/15 text-slate-400',   dot: 'bg-slate-400',   label: 'Plan modifié' },
  'plan.delete':         { icon: Trash2,       badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Plan supprimé' },

  // Budget
  'budget.create':       { icon: DollarSign,   badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Budget ajouté' },
  'budget.update':       { icon: Wallet,       badge: 'bg-amber-500/15 text-amber-400',   dot: 'bg-amber-400',   label: 'Budget modifié' },
  'budget.committed':    { icon: Clock,        badge: 'bg-blue-500/15 text-blue-400',     dot: 'bg-blue-500',    label: 'Budget engagé' },
  'budget.executed':     { icon: CheckCircle2, badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Budget exécuté' },

  // Checklist
  'checklist.create':    { icon: Plus,         badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Tâche ajoutée' },
  'checklist.update':    { icon: CheckCircle2, badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Tâche mise à jour' },
  'checklist.delete':    { icon: Trash2,       badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Tâche supprimée' },

  // Indicators
  'indicator.create':    { icon: Target,       badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Indicateur créé' },
  'indicator.update':    { icon: Edit3,        badge: 'bg-blue-500/15 text-blue-400',     dot: 'bg-blue-400',    label: 'Indicateur mis à jour' },
  'indicator.delete':    { icon: Trash2,       badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Indicateur supprimé' },
};

export const DEFAULT_CONFIG = {
  icon: Shield,
  badge: 'bg-slate-500/15 text-slate-400',
  dot: 'bg-slate-500',
  label: 'Événement',
};

export function humanAction(action: string): string {
  const config = ACTION_CONFIG[action];
  if (config) return config.label;
  return action.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
