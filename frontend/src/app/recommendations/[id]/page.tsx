'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationsApi } from '@/lib/api';
import type { Recommendation } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  RotateCcw,
  Trash2,
  MessageSquare,
  ListTodo,
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

const RECOMMENDATION_PRIORITY_LABELS: Record<string, string> = {
  CRITIQUE: 'Critique',
  ELEVEE: 'Élevée',
  MOYENNE: 'Moyenne',
  FAIBLE: 'Faible',
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    NON_DEMARREE: 'bg-slate-100 text-slate-700',
    EN_COURS: 'bg-blue-100 text-blue-700',
    PARTIELLEMENT_MISE_EN_OEUVRE: 'bg-yellow-100 text-yellow-700',
    REALISEE_A_VALIDER: 'bg-purple-100 text-purple-700',
    EN_RETARD: 'bg-red-100 text-red-700',
    SUSPENDUE: 'bg-orange-100 text-orange-700',
    VALIDEE: 'bg-green-100 text-green-700',
    ROUVERTE: 'bg-indigo-100 text-indigo-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
}

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    CRITIQUE: 'text-red-600',
    ELEVEE: 'text-orange-600',
    MOYENNE: 'text-yellow-600',
    FAIBLE: 'text-slate-600',
  };
  return colors[priority] || 'text-slate-600';
}

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: recommendation, isLoading } = useQuery({
    queryKey: ['recommendations', id],
    queryFn: async () => {
      const res = await recommendationsApi.get(id);
      return res.data as Recommendation;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header title="Chargement..." subtitle="Veuillez patienter" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header title="Introuvable" subtitle="Cette recommandation n'existe pas" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={() => router.push('/recommendations')}>
            <ArrowLeft size={16} />
            Retour aux recommandations
          </Button>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(recommendation.dueDate) < new Date() && recommendation.status !== 'VALIDEE';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header
        title={recommendation.code}
        subtitle={recommendation.title}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/recommendations')}>
              <ArrowLeft size={16} />
              Retour
            </Button>
            <Button variant="ghost" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 size={16} />
              Supprimer
            </Button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header card with status and priority */}
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-[2rem] p-1.5">
          <div className="bg-white rounded-[calc(2rem-0.375rem)] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0f1e38] flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{recommendation.title}</h1>
                  <p className="text-sm text-slate-600">{recommendation.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start sm:items-end shrink-0">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusColor(recommendation.status)}`}>
                  {RECOMMENDATION_STATUS_LABELS[recommendation.status]}
                </span>
                <span className={`text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                  Priorité {RECOMMENDATION_PRIORITY_LABELS[recommendation.priority]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Source */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-xs text-slate-500 mb-2">Source</div>
            <div className="font-medium text-slate-900">{RECOMMENDATION_SOURCE_LABELS[recommendation.source]}</div>
          </div>

          {/* Issued date */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Calendar size={12} />
              Date d'émission
            </div>
            <div className="font-medium text-slate-900">{formatDate(recommendation.issuedAt)}</div>
          </div>

          {/* Due date */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Clock size={12} />
              Date d'échéance
            </div>
            <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
              {formatDate(recommendation.dueDate)}
              {isOverdue && <span className="ml-2 text-xs">(en retard)</span>}
            </div>
          </div>

          {/* Responsible */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <User size={12} />
              Responsable
            </div>
            <div className="font-medium text-slate-900">
              {recommendation.responsible.firstName} {recommendation.responsible.lastName}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-xs text-slate-500 mb-2">Progression</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${recommendation.progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-900">{recommendation.progress}%</span>
            </div>
          </div>

          {/* Validator */}
          {recommendation.validator && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <CheckCircle2 size={12} />
                Validateur
              </div>
              <div className="font-medium text-slate-900">
                {recommendation.validator.firstName} {recommendation.validator.lastName}
              </div>
            </div>
          )}
        </div>

        {/* Actions and Comments sections (placeholders) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo size={18} className="text-slate-600" />
              <h2 className="font-semibold text-slate-900">Actions</h2>
              <Badge variant="secondary" className="ml-auto">
                {recommendation._count?.actions || 0}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">Aucune action pour le moment.</p>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-slate-600" />
              <h2 className="font-semibold text-slate-900">Commentaires</h2>
              <Badge variant="secondary" className="ml-auto">
                {recommendation._count?.comments || 0}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">Aucun commentaire pour le moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
