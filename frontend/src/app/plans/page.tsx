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
import { formatDate } from '@/lib/utils';
import { FolderKanban, Plus, ChevronRight, Calendar, Target, Wallet } from 'lucide-react';
import Link from 'next/link';

function PlanCard({ plan }: { plan: ActionPlan }) {
  const total = plan.axes?.reduce((n, a) => n + (a.activities?.length ?? 0), 0) ?? 0;
  const durationMonths = Math.ceil(
    (new Date(plan.periodEnd).getTime() - new Date(plan.periodStart).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <Link href={`/plans/${plan.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-[#2563eb]/30 transition-all">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0f1e38]/8 flex items-center justify-center shrink-0">
            <FolderKanban size={20} className="text-[#0f1e38]" />
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2563eb] transition-colors mt-1 shrink-0" />
        </div>

        <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{plan.title}</h3>

        {plan.strategicGoals && (
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">{plan.strategicGoals}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={12} className="shrink-0" />
            <span>{formatDate(plan.periodStart)} → {formatDate(plan.periodEnd)}</span>
            <span className="text-slate-300">·</span>
            <span>{durationMonths} mois</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Target size={12} />
              <span>{plan.axes?.length ?? 0} axes</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FolderKanban size={12} />
              <span>{total} activités</span>
            </div>
            {plan.budgetPrevisional && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Wallet size={12} />
                <span>{(plan.budgetPrevisional / 1_000_000).toFixed(1)}M</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

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

export default function PlansPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: plans = [], isLoading } = useQuery<ActionPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => { const r = await plansApi.list(); return r.data; },
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Plans d'action" subtitle={`${plans.length} plan${plans.length > 1 ? 's' : ''}`} />
      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div />
          <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            Nouveau plan
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
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
