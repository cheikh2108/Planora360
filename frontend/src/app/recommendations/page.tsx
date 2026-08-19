'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationsApi, usersApi } from '@/lib/api';
import type { Recommendation, RecommendationStatus, RecommendationPriority, RecommendationSource, User as UserType } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import {
  formatDate,
  RECOMMENDATION_STATUS_LABELS,
  RECOMMENDATION_STATUS_COLORS,
  RECOMMENDATION_STATUS_DOT,
  RECOMMENDATION_PRIORITY_LABELS,
  RECOMMENDATION_PRIORITY_COLORS,
  RECOMMENDATION_SOURCE_LABELS,
} from '@/lib/utils';
import { ShieldAlert, Plus, Calendar, AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

/* ─── RecommendationCard ─────────────────────────────────────────────── */

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const status = RECOMMENDATION_STATUS_LABELS[rec.status];
  const statusColor = RECOMMENDATION_STATUS_COLORS[rec.status];
  const statusDot = RECOMMENDATION_STATUS_DOT[rec.status];
  const priorityLabel = RECOMMENDATION_PRIORITY_LABELS[rec.priority];
  const priorityColor = RECOMMENDATION_PRIORITY_COLORS[rec.priority];

  const isOverdue = new Date(rec.dueDate) < new Date() && rec.status !== 'VALIDEE';

  return (
    <Link href={`/recommendations/${rec.id}`} className="block group">
      {/* Double-Bezel: Outer shell */}
      <div className="bg-slate-50/50 border border-slate-200/60 rounded-[2rem] p-1.5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        {/* Double-Bezel: Inner core */}
        <div className="bg-white rounded-[calc(2rem-0.375rem)] p-5 flex flex-col gap-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">

          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#0f1e38] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ShieldAlert size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-slate-400">{rec.code}</span>
                  {isOverdue && (
                    <AlertTriangle size={12} className="text-red-500" />
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">{rec.title}</h3>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                {status}
              </span>
              <span className={`text-[9px] font-medium ${priorityColor}`}>
                {priorityLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed -mt-1">
            {rec.description}
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar size={11} className="shrink-0 text-slate-400" />
              <span>Émise {formatDate(rec.issuedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={11} className="shrink-0 text-slate-400" />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Échéance {formatDate(rec.dueDate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <User size={11} className="shrink-0 text-slate-400" />
              <span>{rec.responsible.firstName} {rec.responsible.lastName}</span>
            </div>
          </div>

          {/* Progress bar */}
          {rec.progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ width: `${rec.progress}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-500">{rec.progress}%</span>
            </div>
          )}

          {/* Footer badges */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="px-2 py-1 bg-slate-50 rounded-md">
                {RECOMMENDATION_SOURCE_LABELS[rec.source]}
              </span>
            </div>
            {rec._count && (
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                {rec._count.actions > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    {rec._count.actions} actions
                  </span>
                )}
                {rec._count.comments > 0 && (
                  <span className="flex items-center gap-1">
                    💬 {rec._count.comments}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── CreateRecommendationModal ─────────────────────────────────────────────── */

function CreateRecommendationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    source: 'AUDIT_INTERNE' as RecommendationSource,
    priority: 'MOYENNE' as RecommendationPriority,
    issuedAt: new Date().toISOString().split('T')[0],
    dueDate: '',
    responsibleId: '',
    validatorId: '',
  });

  const queryClient = useQueryClient();
  const toast = useToast();

  // Charger la liste des utilisateurs actifs pour assignation
  const { data: usersData } = useQuery({
    queryKey: ['users', 'for-assignment'],
    queryFn: async () => {
      const res = await usersApi.listForAssignment();
      return res.data as UserType[];
    },
    enabled: open,
  });
  // Guard défensif absolu : s'assurer que users est TOUJOURS un tableau
  const users = Array.isArray(usersData) ? usersData : [];

  const createMutation = useMutation({
    mutationFn: () => {
      // Nettoyer les champs vides avant envoi
      const payload: any = { ...form };
      if (!payload.validatorId) delete payload.validatorId;
      return recommendationsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Recommandation créée', 'La nouvelle recommandation a été ajoutée avec succès.');
      onClose();
      setForm({
        title: '',
        description: '',
        source: 'AUDIT_INTERNE',
        priority: 'MOYENNE',
        issuedAt: new Date().toISOString().split('T')[0],
        dueDate: '',
        responsibleId: '',
        validatorId: '',
      });
    },
    onError: (err: any) => {
      toast.error('Erreur', err?.message || 'Impossible de créer la recommandation.');
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle recommandation">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Titre" required>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ex: Renforcer le système de contrôle interne"
            required
          />
        </FormField>

        <FormField label="Description" required>
          <Textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Décrivez le constat et les actions attendues"
            rows={4}
            required
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Source" required>
            <Select
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as RecommendationSource }))}
              required
            >
              {Object.entries(RECOMMENDATION_SOURCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Priorité" required>
            <Select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as RecommendationPriority }))}
              required
            >
              {Object.entries(RECOMMENDATION_PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Date d'émission" required>
            <Input
              type="date"
              value={form.issuedAt}
              onChange={(e) => setForm((f) => ({ ...f, issuedAt: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Date d'échéance" required>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              required
            />
          </FormField>
        </div>

        <FormField label="Responsable principal" required>
          <Select
            value={form.responsibleId}
            onChange={(e) => setForm((f) => ({ ...f, responsibleId: e.target.value }))}
            required
          >
            <option value="">Sélectionner un responsable</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} — {user.role.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Validateur (optionnel)">
          <Select
            value={form.validatorId}
            onChange={(e) => setForm((f) => ({ ...f, validatorId: e.target.value }))}
          >
            <option value="">Aucun validateur assigné</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} — {user.role.name}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Créer la recommandation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Page ─────────────────────────────────────────────── */

export default function RecommendationsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    status?: RecommendationStatus;
    priority?: RecommendationPriority;
    source?: RecommendationSource;
    search?: string;
  }>({});

  const limit = 20;

  const { data: rawRecommendations, isLoading } = useQuery({
    queryKey: ['recommendations', filters, page],
    queryFn: async () => {
      const res = await recommendationsApi.getAll({ ...filters, limit, page });
      const response = res.data as any;

      // Triple sécurité : gérer TOUS les formats possibles
      if (!response) {
        // Réponse vide/null/undefined
        return { recommendations: [], total: 0, page, limit };
      }

      if (Array.isArray(response)) {
        // Format 1: tableau direct [rec1, rec2, ...]
        return { recommendations: response, total: response.length, page, limit };
      }

      if (typeof response === 'object') {
        // Format 2: objet { recommendations: [...], total: X }
        if (Array.isArray(response.recommendations)) {
          return {
            recommendations: response.recommendations,
            total: response.total ?? response.recommendations.length,
            page: response.page ?? page,
            limit: response.limit ?? limit,
          };
        }

        // Format 3: objet avec autre propriété contenant un tableau
        const arrayProp = Object.values(response).find(v => Array.isArray(v));
        if (arrayProp && Array.isArray(arrayProp)) {
          return { recommendations: arrayProp, total: arrayProp.length, page, limit };
        }
      }

      // Fallback ultime : format totalement inconnu
      console.error('[RECOMMENDATIONS] Format API inconnu:', response);
      return { recommendations: [], total: 0, page: 1, limit: 20 };
    },
  });

  // Triple guard défensif : s'assurer que recommendations est TOUJOURS un tableau
  const recommendations = Array.isArray(rawRecommendations?.recommendations)
    ? rawRecommendations.recommendations
    : (Array.isArray(rawRecommendations) ? rawRecommendations : []);
  const total = rawRecommendations?.total ?? 0;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data: stats } = useQuery({
    queryKey: ['recommendations', 'stats'],
    queryFn: async () => {
      const res = await recommendationsApi.getStats();
      return res.data;
    },
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-[#f8fafc]">
      <Header
        title="Recommandations"
        subtitle="Suivi des recommandations issues d'audits, missions et évaluations"
        actions={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            Nouvelle recommandation
          </Button>
        }
      />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500 mt-1">Total</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(stats.byStatus) ? (stats.byStatus.find((s: any) => s.status === 'EN_COURS')?._count || 0) : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">En cours</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-xs text-slate-500 mt-1">En retard</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(stats.byStatus) ? (stats.byStatus.find((s: any) => s.status === 'VALIDEE')?._count || 0) : 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Validées</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value as RecommendationStatus | undefined }))
            }
            className="flex-1 min-w-[200px]"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(RECOMMENDATION_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.priority || ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, priority: e.target.value as RecommendationPriority | undefined }))
            }
            className="flex-1 min-w-[200px]"
          >
            <option value="">Toutes les priorités</option>
            {Object.entries(RECOMMENDATION_PRIORITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.source || ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, source: e.target.value as RecommendationSource | undefined }))
            }
            className="flex-1 min-w-[200px]"
          >
            <option value="">Toutes les sources</option>
            {Object.entries(RECOMMENDATION_SOURCE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Aucune recommandation"
            description="Commencez par créer votre première recommandation"
            action={
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus size={16} />
                Nouvelle recommandation
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec: Recommendation) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>

            {/* Pagination */}
            {!isLoading && total > limit && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 mt-6">
                <Pagination
                  page={page}
                  total={total}
                  limit={limit}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {createModalOpen && (
        <CreateRecommendationModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
}
