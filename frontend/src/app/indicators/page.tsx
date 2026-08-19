'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { indicatorsApi, plansApi, activitiesApi } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import type { Indicator, ActionPlan, Activity } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useToast } from '@/components/ui/toast';
import { formatDate, cn } from '@/lib/utils';
import { Target, Plus, Trash2, Edit3, TrendingUp, TrendingDown } from 'lucide-react';

function achievementRate(indicator: Indicator): number {
  if (indicator.target <= 0) return 0;
  return Math.min(100, Math.round((indicator.achieved / indicator.target) * 100));
}

function RateChip({ rate }: { rate: number }) {
  const color = rate >= 80 ? 'bg-green-100 text-green-700' : rate >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums', color)}>
      {rate}%
    </span>
  );
}

/* ─── Modal création / édition ───────────────────────── */
function IndicatorModal({
  open, onClose, indicator, activities,
}: {
  open: boolean;
  onClose: () => void;
  indicator?: Indicator;
  activities: Activity[];
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({
    title: indicator?.title ?? '',
    unit: indicator?.unit ?? '',
    baseline: String(indicator?.baseline ?? '0'),
    target: String(indicator?.target ?? ''),
    achieved: String(indicator?.achieved ?? '0'),
    activityId: indicator?.activityId ?? '',
    dueDate: indicator?.dueDate ? indicator.dueDate.slice(0, 10) : '',
  });

  const isEdit = !!indicator;

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        title: form.title,
        unit: form.unit || undefined,
        baseline: Number(form.baseline),
        target: Number(form.target),
        achieved: Number(form.achieved),
        activityId: form.activityId || undefined,
        dueDate: form.dueDate || undefined,
      };
      return isEdit
        ? indicatorsApi.update(indicator!.id, payload)
        : indicatorsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicators'], exact: false });
      toast.success(isEdit ? 'Indicateur mis à jour' : 'Indicateur créé');
      onClose();
    },
    onError: () => toast.error('Erreur', 'Impossible de sauvegarder l\'indicateur.'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modifier l\'indicateur' : 'Nouvel indicateur'} size="md">
      <form onSubmit={e => { e.preventDefault(); if (form.title && form.target) mutate(); }} className="space-y-4">
        <FormField label="Intitulé de l'indicateur" required>
          <Input value={form.title} onChange={set('title')} placeholder="Ex: Taux de réalisation des formations" autoFocus />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Unité de mesure">
            <Input value={form.unit} onChange={set('unit')} placeholder="Ex: %, personnes, km..." />
          </FormField>
          <FormField label="Activité liée">
            <Select value={form.activityId} onChange={set('activityId')}>
              <option value="">Global (aucune activité)</option>
              {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Valeur de base">
            <Input type="number" value={form.baseline} onChange={set('baseline')} min="0" step="any" />
          </FormField>
          <FormField label="Cible" required>
            <Input type="number" value={form.target} onChange={set('target')} min="0" step="any" placeholder="0" />
          </FormField>
          <FormField label="Réalisé">
            <Input type="number" value={form.achieved} onChange={set('achieved')} min="0" step="any" />
          </FormField>
        </div>
        <FormField label="Échéance">
          <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
        </FormField>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isPending}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Page ─────────────────────────────────────────── */
export default function IndicatorsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Indicator | undefined>();
  const [filterActivity, setFilterActivity] = useState('');
  const [page, setPage] = useState(1);

  const limit = 25;

  useEffect(() => { setPage(1); }, [filterActivity]);

  const { data: indicatorsPage, isLoading } = useQuery({
    queryKey: ['indicators', filterActivity, page],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (filterActivity) params.activityId = filterActivity;
      const r = await indicatorsApi.list(params);
      return r.data as { data: Indicator[]; total: number; page: number; limit: number };
    },
  });
  // Guard défensif absolu
  const indicators: Indicator[] = Array.isArray(indicatorsPage?.data) ? indicatorsPage.data : [];
  const total = indicatorsPage?.total ?? 0;

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['activities-all'],
    queryFn: async () => { const r = await activitiesApi.list({ limit: 1000 }); return (r.data as any).data ?? []; },
    staleTime: 60_000,
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => indicatorsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['indicators'], exact: false });
      toast.success('Indicateur supprimé');
    },
    onError: () => toast.error('Erreur', 'Impossible de supprimer.'),
  });

  const totalOnTrack = indicators.filter(i => achievementRate(i) >= 80).length;
  const totalAtRisk = indicators.filter(i => { const r = achievementRate(i); return r >= 50 && r < 80; }).length;
  const totalLagging = indicators.filter(i => achievementRate(i) < 50).length;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Indicateurs de performance"
        subtitle={`${total} indicateur${total > 1 ? 's' : ''}`}
        actions={
          <Button icon={<Plus size={16} />} onClick={() => { setEditTarget(undefined); setModalOpen(true); }}>
            Nouvel indicateur
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* KPI strip */}
        {!isLoading && total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: total, color: 'text-slate-900', bg: 'bg-white' },
              { label: 'Atteints (≥80%)', value: totalOnTrack, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'En risque (50–79%)', value: totalAtRisk, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'En retard (<50%)', value: totalLagging, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(k => (
              <div key={k.label} className={cn('rounded-2xl border border-slate-200 p-4', k.bg)}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
                <p className={cn('text-3xl font-bold tabular-nums mt-1', k.color)}>{k.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select
            value={filterActivity}
            onChange={e => setFilterActivity(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white max-w-xs"
          >
            <option value="">Toutes les activités</option>
            {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tableau de bord des indicateurs</p>
            {total > 0 && <span className="text-xs tabular-nums text-slate-400">{total}</span>}
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : indicators.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Aucun indicateur"
              description="Créez des indicateurs pour mesurer l'atteinte de vos objectifs."
              action={
                <Button icon={<Plus size={16} />} onClick={() => { setEditTarget(undefined); setModalOpen(true); }}>
                  Créer un indicateur
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Indicateur</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">Base</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cible</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Réalisé</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell w-36">Progression</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Échéance</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody>
                  {indicators.map(ind => {
                    const rate = achievementRate(ind);
                    const isGood = rate >= 80;
                    return (
                      <tr key={ind.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-900">{ind.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {ind.unit && <span className="text-xs text-slate-400">{ind.unit}</span>}
                            {ind.activity && (
                              <span className="text-xs text-slate-400 truncate max-w-40">
                                · {ind.activity.title}
                              </span>
                            )}
                            {!ind.activity && (
                              <span className="text-xs bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full">Global</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right hidden sm:table-cell text-sm text-slate-500 tabular-nums">{ind.baseline}</td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700 tabular-nums">{ind.target}</td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          <div className="flex items-center justify-end gap-1.5">
                            {isGood ? <TrendingUp size={13} className="text-green-500" /> : <TrendingDown size={13} className="text-red-400" />}
                            <span className={cn('text-sm font-bold', isGood ? 'text-green-600' : 'text-slate-700')}>{ind.achieved}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={rate} size="sm" className="flex-1" />
                            <RateChip rate={rate} />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right hidden lg:table-cell text-xs text-slate-400">
                          {ind.dueDate ? formatDate(ind.dueDate) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button
                              onClick={() => { setEditTarget(ind); setModalOpen(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => { if (confirm('Supprimer cet indicateur ?')) remove(ind.id); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {total > 20 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <Pagination page={page} total={total} limit={limit} onChange={setPage} />
            </div>
          )}
        </div>
      </main>

      <IndicatorModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(undefined); }}
        indicator={editTarget}
        activities={activities}
      />
    </div>
  );
}
