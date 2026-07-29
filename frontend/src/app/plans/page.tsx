'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '@/lib/api';
import type { ActionPlan } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Textarea } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import { FolderKanban, Plus, ChevronRight, Calendar, Target, Wallet, Activity } from 'lucide-react';
import Link from 'next/link';

/* ─── helpers ─────────────────────────────────────────────── */

function planStatus(plan: ActionPlan): { label: string; cls: string } {
  const now = new Date();
  const start = new Date(plan.periodStart);
  const end = new Date(plan.periodEnd);
  if (now < start) return { label: 'À venir', cls: 'bg-slate-100 text-slate-500' };
  if (now > end)   return { label: 'Terminé',  cls: 'bg-teal-50 text-teal-600' };
  return { label: 'En cours', cls: 'bg-blue-50 text-blue-600' };
}

function durationMonths(plan: ActionPlan) {
  return Math.ceil(
    (new Date(plan.periodEnd).getTime() - new Date(plan.periodStart).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
}

/* ─── PlanCard ─────────────────────────────────────────────── */

function PlanCard({ plan }: { plan: ActionPlan }) {
  const total = plan.axes?.reduce((n, a) => n + (a.activities?.length ?? 0), 0) ?? 0;
  const months = durationMonths(plan);
  const status = planStatus(plan);

  return (
    <Link href={`/plans/${plan.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-[#2563eb]/30 transition-all flex flex-col gap-4">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0f1e38] flex items-center justify-center shrink-0">
              <FolderKanban size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">{plan.title}</h3>
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Strategic goals */}
        {plan.strategicGoals && (
          <p className="text-xs text-slate-400 line-clamp-2 -mt-1">{plan.strategicGoals}</p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={11} className="shrink-0 text-slate-400" />
            <span>{formatDate(plan.periodStart)} – {formatDate(plan.periodEnd)}</span>
            <span className="text-slate-300">·</span>
            <span className="font-medium text-slate-600">{months} mois</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Target size={11} className="text-slate-400" />
            <span><span className="font-semibold text-slate-700">{plan.axes?.length ?? 0}</span> axes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Activity size={11} className="text-slate-400" />
            <span><span className="font-semibold text-slate-700">{total}</span> activités</span>
          </div>
          {plan.budgetPrevisional ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
              <Wallet size={11} className="text-slate-400" />
              <span className="font-semibold text-slate-700">
                {(plan.budgetPrevisional / 1_000_000).toFixed(1)}M FCFA
              </span>
            </div>
          ) : null}
          <ChevronRight size={14} className="text-slate-300 group-hover:text-[#2563eb] transition-colors ml-auto shrink-0" />
        </div>
      </div>
    </Link>
  );
}

/* ─── CreatePlanModal ──────────────────────────────────────── */

function CreatePlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', periodStart: '', periodEnd: '', strategicGoals: '', expectedResults: '', budgetPrevisional: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: () => plansApi.create({
      ...form,
      budgetPrevisional: form.budgetPrevisional ? Number(form.budgetPrevisional) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      onClose();
      setForm({ title: '', periodStart: '', periodEnd: '', strategicGoals: '', expectedResults: '', budgetPrevisional: '' });
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Titre requis';
    if (!form.periodStart) e.periodStart = 'Date de début requise';
    if (!form.periodEnd) e.periodEnd = 'Date de fin requise';
    if (form.periodStart && form.periodEnd && form.periodStart >= form.periodEnd)
      e.periodEnd = 'La date de fin doit être après la date de début';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) mutate();
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Nouveau plan d'action" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Titre du plan" required error={errors.title}>
          <Input value={form.title} onChange={set('title')} placeholder="Plan d'action annuel 2025" error={!!errors.title} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date de début" required error={errors.periodStart}>
            <Input type="date" value={form.periodStart} onChange={set('periodStart')} error={!!errors.periodStart} />
          </FormField>
          <FormField label="Date de fin" required error={errors.periodEnd}>
            <Input type="date" value={form.periodEnd} onChange={set('periodEnd')} error={!!errors.periodEnd} />
          </FormField>
        </div>
        <FormField label="Objectifs stratégiques">
          <Textarea value={form.strategicGoals} onChange={set('strategicGoals')} rows={3} placeholder="Décrire les objectifs stratégiques..." />
        </FormField>
        <FormField label="Résultats attendus">
          <Textarea value={form.expectedResults} onChange={set('expectedResults')} rows={3} placeholder="Quels résultats sont attendus..." />
        </FormField>
        <FormField label="Budget prévisionnel (FCFA)">
          <Input type="number" value={form.budgetPrevisional} onChange={set('budgetPrevisional')} placeholder="Ex: 50000000" min="0" />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isPending} icon={<Plus size={16} />}>Créer le plan</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

export default function PlansPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: plans = [], isLoading } = useQuery<ActionPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => { const r = await plansApi.list(); return r.data; },
  });

  const totalActivities = plans.reduce(
    (n, p) => n + (p.axes?.reduce((m, a) => m + (a.activities?.length ?? 0), 0) ?? 0), 0
  );
  const totalBudget = plans.reduce((n, p) => n + (p.budgetPrevisional ?? 0), 0);
  const active = plans.filter(p => {
    const now = new Date();
    return new Date(p.periodStart) <= now && new Date(p.periodEnd) >= now;
  }).length;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Plans d'action" subtitle={`${plans.length} plan${plans.length > 1 ? 's' : ''}`} />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* KPI strip */}
        {!isLoading && plans.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Plans total', value: plans.length, display: String(plans.length), color: 'text-slate-900' },
              { label: 'En cours', value: active, display: String(active), color: 'text-blue-600' },
              { label: 'Activités', value: totalActivities, display: String(totalActivities), color: 'text-indigo-600' },
              { label: 'Budget total', value: totalBudget, display: totalBudget > 0 ? `${(totalBudget / 1_000_000).toFixed(0)}M` : '0', color: 'text-slate-700' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
                <p className={`text-4xl font-bold tabular-nums ${k.color}`}>{k.display}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {isLoading ? '' : `${plans.length} plan${plans.length > 1 ? 's' : ''}`}
          </p>
          <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            Nouveau plan
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Aucun plan d'action"
            description="Créez votre premier plan d'action pour commencer le suivi."
            action={<Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>Créer un plan</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        )}
      </main>
      <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
