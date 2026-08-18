'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationsApi } from '@/lib/api';
import type { Recommendation } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { cn, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  MessageSquare,
  ListTodo,
  Plus,
  Edit,
  X,
} from 'lucide-react';

const RECOMMENDATION_STATUS_LABELS: Record<string, string> = {
  NON_DEMARREE: 'Non démarrée',
  EN_COURS: 'En cours',
  PARTIELLEMENT_MISE_EN_OEUVRE: 'Partiellement mise en œuvre',
  REALISEE_A_VALIDER: 'Réalisée à valider',
  EN_RETARD: 'En retard',
  SUSPENDUE: 'Suspendue',
  VALIDEE: 'Validée',
  ROUVERTE: 'Rouverte',
};

const RECOMMENDATION_STATUS_COLORS: Record<string, string> = {
  NON_DEMARREE: 'bg-slate-100 text-slate-700',
  EN_COURS: 'bg-blue-100 text-blue-700',
  PARTIELLEMENT_MISE_EN_OEUVRE: 'bg-yellow-100 text-yellow-700',
  REALISEE_A_VALIDER: 'bg-purple-100 text-purple-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  SUSPENDUE: 'bg-orange-100 text-orange-700',
  VALIDEE: 'bg-green-100 text-green-700',
  ROUVERTE: 'bg-indigo-100 text-indigo-700',
};

const RECOMMENDATION_PRIORITY_LABELS: Record<string, string> = {
  CRITIQUE: 'Critique',
  ELEVEE: 'Élevée',
  MOYENNE: 'Moyenne',
  FAIBLE: 'Faible',
};

const RECOMMENDATION_PRIORITY_COLORS: Record<string, string> = {
  CRITIQUE: 'text-red-600',
  ELEVEE: 'text-orange-600',
  MOYENNE: 'text-yellow-600',
  FAIBLE: 'text-slate-600',
};

const RECOMMENDATION_SOURCE_LABELS: Record<string, string> = {
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
  REVUE_GOUVERNANCE: 'Revue de gouvernance',
  INSPECTION: 'Inspection',
  REVUE_DOCUMENTAIRE: 'Revue documentaire',
  VERIFICATION_CONFORMITE: 'Vérification de conformité',
  AUTRE: 'Autre',
};

/* ─── Modals ─────────────────────────────────────────────── */

function ChangeStatusModal({ open, onClose, currentStatus, recommendationId }: any) {
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => recommendationsApi.changeStatus(recommendationId, newStatus, comment || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Statut mis à jour', 'Le statut a été changé avec succès.');
      onClose();
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || 'Impossible de changer le statut.');
    },
  });

  const availableStatuses = () => {
    switch (currentStatus) {
      case 'NON_DEMARREE':
        return ['EN_COURS'];
      case 'EN_COURS':
        return ['PARTIELLEMENT_MISE_EN_OEUVRE', 'REALISEE_A_VALIDER', 'SUSPENDUE'];
      case 'PARTIELLEMENT_MISE_EN_OEUVRE':
        return ['EN_COURS', 'REALISEE_A_VALIDER', 'SUSPENDUE'];
      case 'REALISEE_A_VALIDER':
        return ['VALIDEE', 'EN_COURS'];
      case 'SUSPENDUE':
        return ['EN_COURS', 'ROUVERTE'];
      case 'VALIDEE':
        return ['ROUVERTE'];
      case 'ROUVERTE':
        return ['EN_COURS'];
      default:
        return [];
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Changer le statut">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newStatus) mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Nouveau statut" required>
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
            <option value="">Sélectionner un statut</option>
            {availableStatuses().map((s) => (
              <option key={s} value={s}>
                {RECOMMENDATION_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Commentaire (optionnel)">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            rows={3}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Confirmer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function SuspendModal({ open, onClose, recommendationId }: any) {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => recommendationsApi.suspend(recommendationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Recommandation suspendue', 'La recommandation a été suspendue.');
      onClose();
      setReason('');
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || 'Impossible de suspendre.');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Suspendre la recommandation">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Raison de la suspension" required>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Manque de ressources, dépendances externes..."
            rows={4}
            required
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Suspendre
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ReopenModal({ open, onClose, recommendationId }: any) {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => recommendationsApi.reopen(recommendationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Recommandation rouverte', 'La recommandation a été rouverte.');
      onClose();
      setReason('');
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || 'Impossible de rouvrir.');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Rouvrir la recommandation">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Raison de la réouverture" required>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Non-conformité détectée, nouvelle exigence..."
            rows={4}
            required
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Rouvrir
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AddActionModal({ open, onClose, recommendationId }: any) {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => recommendationsApi.addAction(recommendationId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', recommendationId] });
      toast.success('Action ajoutée', "L'action a été ajoutée avec succès.");
      onClose();
      setForm({ title: '', description: '', dueDate: '' });
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || "Impossible d'ajouter l'action.");
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une action">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Titre de l'action" required>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ex: Mettre à jour le manuel de procédures"
            required
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Détails de l'action à réaliser..."
            rows={3}
          />
        </FormField>

        <FormField label="Échéance">
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Ajouter
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AddCommentModal({ open, onClose, recommendationId }: any) {
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => recommendationsApi.addComment(recommendationId, content, isImportant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', recommendationId, 'comments'] });
      toast.success('Commentaire ajouté', 'Le commentaire a été ajouté avec succès.');
      onClose();
      setContent('');
      setIsImportant(false);
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || 'Impossible d\'ajouter le commentaire.');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un commentaire">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Commentaire" required>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Votre commentaire..."
            rows={5}
            required
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300"
          />
          <span className="text-slate-700">Marquer comme important</span>
        </label>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Publier
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function UpdateProgressModal({ open, onClose, recommendationId, currentProgress }: any) {
  const [progress, setProgress] = useState(currentProgress);
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => recommendationsApi.update(recommendationId, { progress: parseInt(progress, 10) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', recommendationId] });
      toast.success('Progression mise à jour', 'La progression a été mise à jour.');
      onClose();
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || 'Impossible de mettre à jour la progression.');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Mettre à jour la progression">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Progression (%)" required>
          <Input
            type="number"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            required
          />
        </FormField>

        <ProgressBar value={parseInt(progress, 10) || 0} showLabel size="md" />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Mettre à jour
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Page ─────────────────────────────────────────────── */

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [addActionOpen, setAddActionOpen] = useState(false);
  const [addCommentOpen, setAddCommentOpen] = useState(false);
  const [updateProgressOpen, setUpdateProgressOpen] = useState(false);

  const { data: recommendation, isLoading } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: async () => {
      const res = await recommendationsApi.get(id);
      return res.data as Recommendation;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['recommendations', id, 'comments'],
    queryFn: async () => {
      const res = await recommendationsApi.getComments(id);
      return res.data as any[];
    },
    enabled: !!recommendation,
  });

  const deleteActionMutation = useMutation({
    mutationFn: (actionId: string) => recommendationsApi.removeAction(actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', id] });
      toast.success('Action supprimée', "L'action a été supprimée.");
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || "Impossible de supprimer l'action.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => recommendationsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Recommandation supprimée', 'La recommandation a été supprimée avec succès.');
      router.push('/recommendations');
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || 'Impossible de supprimer la recommandation.');
    },
  });

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recommandation ?')) {
      deleteMutation.mutate();
    }
  };

  const handleDeleteAction = (actionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
      deleteActionMutation.mutate(actionId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header title="Chargement..." subtitle="Veuillez patienter" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header title="Introuvable" subtitle="Cette recommandation n'existe pas" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={() => router.push('/recommendations')}>
            <ArrowLeft size={16} />
            Retour aux recommandations
          </Button>
        </main>
      </div>
    );
  }

  const isOverdue = new Date(recommendation.dueDate) < new Date() && recommendation.status !== 'VALIDEE';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header
        title={recommendation.code}
        subtitle={recommendation.title}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', RECOMMENDATION_STATUS_COLORS[recommendation.status])}>
                  {RECOMMENDATION_STATUS_LABELS[recommendation.status]}
                </span>
                <span className={cn('text-xs font-medium', RECOMMENDATION_PRIORITY_COLORS[recommendation.priority])}>
                  {RECOMMENDATION_PRIORITY_LABELS[recommendation.priority]}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">{recommendation.title}</h1>
              {recommendation.description && (
                <p className="text-sm text-slate-600 mb-4">{recommendation.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={13} />
                  <span>{RECOMMENDATION_SOURCE_LABELS[recommendation.source]}</span>
                </div>
                {recommendation.responsible && (
                  <div className="flex items-center gap-1.5">
                    <User size={13} />
                    <span>{recommendation.responsible.firstName} {recommendation.responsible.lastName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Émise {formatDate(recommendation.issuedAt)}</span>
                </div>
                <div className={cn('flex items-center gap-1.5', isOverdue && 'text-red-600 font-semibold')}>
                  <Clock size={13} />
                  <span>Échéance {formatDate(recommendation.dueDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Progression</p>
                <p className="text-3xl font-bold text-slate-900">{recommendation.progress}%</p>
              </div>
              <ProgressBar value={recommendation.progress} className="w-40" size="md" showLabel={false} />
              <Button size="sm" onClick={() => setUpdateProgressOpen(true)}>
                <Edit size={14} />
                Modifier
              </Button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {recommendation.status === 'NON_DEMARREE' && (
            <Button onClick={() => setChangeStatusOpen(true)}>
              <Play size={16} />
              Démarrer
            </Button>
          )}
          {['EN_COURS', 'PARTIELLEMENT_MISE_EN_OEUVRE', 'REALISEE_A_VALIDER'].includes(recommendation.status) && (
            <Button onClick={() => setChangeStatusOpen(true)}>
              <Edit size={16} />
              Changer le statut
            </Button>
          )}
          {['EN_COURS', 'PARTIELLEMENT_MISE_EN_OEUVRE'].includes(recommendation.status) && (
            <Button variant="ghost" onClick={() => setSuspendOpen(true)}>
              <Pause size={16} />
              Suspendre
            </Button>
          )}
          {['SUSPENDUE', 'VALIDEE'].includes(recommendation.status) && (
            <Button variant="ghost" onClick={() => setReopenOpen(true)}>
              <RotateCcw size={16} />
              Rouvrir
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
          >
            <Trash2 size={16} />
            Supprimer
          </Button>
        </div>

        {/* Actions and Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListTodo size={18} className="text-slate-600" />
                <h2 className="font-semibold text-slate-900">Actions</h2>
                <span className="text-xs text-slate-500">({recommendation.actions?.length || 0})</span>
              </div>
              <Button size="sm" onClick={() => setAddActionOpen(true)}>
                <Plus size={14} />
                Ajouter
              </Button>
            </div>
            {recommendation.actions && recommendation.actions.length > 0 ? (
              <div className="space-y-3">
                {recommendation.actions.map((action: any) => (
                  <div key={action.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 text-sm mb-1">{action.title}</h3>
                        {action.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-2">{action.description}</p>
                        )}
                        {action.dueDate && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={10} />
                            Échéance : {formatDate(action.dueDate)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAction(action.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucune action pour le moment.</p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-slate-600" />
                <h2 className="font-semibold text-slate-900">Commentaires</h2>
                <span className="text-xs text-slate-500">({comments.length})</span>
              </div>
              <Button size="sm" onClick={() => setAddCommentOpen(true)}>
                <Plus size={14} />
                Ajouter
              </Button>
            </div>
            {comments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className={cn(
                      'border rounded-xl p-4',
                      comment.isImportant ? 'border-orange-300 bg-orange-50' : 'border-slate-200'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="font-medium text-slate-900 text-sm">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucun commentaire pour le moment.</p>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ChangeStatusModal
        open={changeStatusOpen}
        onClose={() => setChangeStatusOpen(false)}
        currentStatus={recommendation.status}
        recommendationId={id}
      />
      <SuspendModal open={suspendOpen} onClose={() => setSuspendOpen(false)} recommendationId={id} />
      <ReopenModal open={reopenOpen} onClose={() => setReopenOpen(false)} recommendationId={id} />
      <AddActionModal open={addActionOpen} onClose={() => setAddActionOpen(false)} recommendationId={id} />
      <AddCommentModal open={addCommentOpen} onClose={() => setAddCommentOpen(false)} recommendationId={id} />
      <UpdateProgressModal
        open={updateProgressOpen}
        onClose={() => setUpdateProgressOpen(false)}
        recommendationId={id}
        currentProgress={recommendation.progress}
      />
    </div>
  );
}
