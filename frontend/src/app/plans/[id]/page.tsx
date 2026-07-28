'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi, activitiesApi } from '@/lib/api';
import api from '@/lib/api';
import type { ActionPlan, Axis, Activity } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatCurrency, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/utils';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, Calendar, User, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function AxisSection({ axis, planId }: { axis: Axis; planId: string }) {
  const [open, setOpen] = useState(true);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const qc = useQueryClient();

  const { mutate: createActivity, isPending } = useMutation({
    mutationFn: (data: Record<string, unknown>) => activitiesApi.create({ ...data, axisId: axis.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plan', planId] }); setAddActivityOpen(false); },
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Axis header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-2 h-2 rounded-full bg-[#2563eb] shrink-0" />
        <h3 className="font-semibold text-slate-800 text-sm flex-1">{axis.title}</h3>
        <span className="text-xs text-slate-400">{axis.activities?.length ?? 0} activités</span>
        {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </div>

      {open && (
        <>
          {(axis.activities ?? []).length === 0 ? (
            <div className="px-5 py-6 border-t border-slate-100">
              <EmptyState
                icon={BarChart3}
                title="Aucune activité dans cet axe"
                description="Ajoutez une première activité pour structurer cet axe."
              />
            </div>
          ) : (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {(axis.activities ?? []).map((act) => (
                <Link key={act.id} href={`/activities/${act.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#2563eb]">{act.title}</p>
                    {act.responsible && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <User size={11} className="text-slate-400" />
                        <span className="text-xs text-slate-400">{act.responsible.firstName} {act.responsible.lastName}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={act.status} />
                  <span className={cn('text-xs font-semibold hidden lg:block', PRIORITY_COLORS[act.priority])}>
                    {PRIORITY_LABELS[act.priority]}
                  </span>
                  <div className="w-24 hidden sm:block">
                    <ProgressBar value={act.completionRate} showLabel size="sm" />
                  </div>
                  {act.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 hidden md:flex">
                      <Calendar size={11} />
                      <span>{formatDate(act.dueDate)}</span>
                    </div>
                  )}
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-[#2563eb] shrink-0" />
                </Link>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={(e) => { e.stopPropagation(); setAddActivityOpen(true); }}
              className="flex items-center gap-1.5 text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
            >
              <Plus size={14} /> Ajouter une activité
            </button>
          </div>
        </>
      )}

      <AddActivityModal
        open={addActivityOpen}
        onClose={() => setAddActivityOpen(false)}
        onCreate={createActivity}
        loading={isPending}
      />
    </div>
  );
}

function AddActivityModal({
  open, onClose, onCreate, loading
}: {
  open: boolean; onClose: () => void;
  onCreate: (data: Record<string, unknown>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'NORMALE', startDate: '', dueDate: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({ ...form, startDate: form.startDate || undefined, dueDate: form.dueDate || undefined });
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle activité" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Titre" required>
          <Input value={form.title} onChange={set('title')} placeholder="Titre de l'activité" />
        </FormField>
        <FormField label="Description">
          <Textarea value={form.description} onChange={set('description')} rows={3} placeholder="Description..." />
        </FormField>
        <FormField label="Priorité">
          <Select value={form.priority} onChange={set('priority')}>
            <option value="BASSE">Basse</option>
            <option value="NORMALE">Normale</option>
            <option value="HAUTE">Haute</option>
            <option value="CRITIQUE">Critique</option>
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date de début">
            <Input type="date" value={form.startDate} onChange={set('startDate')} />
          </FormField>
          <FormField label="Échéance">
            <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </FormField>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={loading}>Créer l'activité</Button>
        </div>
      </form>
    </Modal>
  );
}

function AddAxisModal({ open, onClose, planId }: { open: boolean; onClose: () => void; planId: string }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/action-plans/${planId}/axes`, { title }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plan', planId] }); onClose(); setTitle(''); },
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvel axe" size="sm">
      <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) mutate(); }} className="space-y-4">
        <FormField label="Titre de l'axe" required>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Axe stratégique 1" autoFocus />
        </FormField>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isPending}>Créer l'axe</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [addAxisOpen, setAddAxisOpen] = useState(false);

  const { data: plan, isLoading } = useQuery<ActionPlan>({
    queryKey: ['plan', id],
    queryFn: async () => { const r = await plansApi.get(id); return r.data; },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <Header title="Chargement..." />
        <main className="px-4 md:px-6 py-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </main>
      </div>
    );
  }

  if (!plan) return null;

  const totalActivities = plan.axes?.reduce((n, a) => n + (a.activities?.length ?? 0), 0) ?? 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title={plan.title} subtitle={`${formatDate(plan.periodStart)} — ${formatDate(plan.periodEnd)}`} />
      <main className="px-4 md:px-6 py-6 space-y-6">

        {/* Back + actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Retour aux plans
          </button>
          <Button icon={<Plus size={16} />} onClick={() => setAddAxisOpen(true)}>Ajouter un axe</Button>
        </div>

        {/* Plan stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Axes', value: plan.axes?.length ?? 0 },
            { label: 'Activités', value: totalActivities },
            { label: 'Durée', value: `${Math.ceil((new Date(plan.periodEnd).getTime() - new Date(plan.periodStart).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois` },
            { label: 'Budget prévu', value: plan.budgetPrevisional ? formatCurrency(plan.budgetPrevisional) : '—' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Objectifs */}
        {plan.strategicGoals && (
          <div className="bg-[#0f1e38]/4 rounded-2xl p-5 border border-[#0f1e38]/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f1e38]/50 mb-2">Objectifs stratégiques</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.strategicGoals}</p>
          </div>
        )}

        {/* Axes */}
        {(plan.axes ?? []).length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Aucun axe défini"
            description="Structurez votre plan en créant des axes thématiques."
            action={<Button icon={<Plus size={16} />} onClick={() => setAddAxisOpen(true)}>Ajouter un axe</Button>}
          />
        ) : (
          <div className="space-y-4">
            {plan.axes?.map(axis => (
              <AxisSection key={axis.id} axis={axis} planId={id} />
            ))}
          </div>
        )}
      </main>

      <AddAxisModal open={addAxisOpen} onClose={() => setAddAxisOpen(false)} planId={id} />
    </div>
  );
}
