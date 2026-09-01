'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validationsApi } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import type { Activity } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Select, Textarea } from '@/components/ui/form-field';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ValidationPipeline } from '@/components/dashboard/validation-pipeline';
import { formatDate, formatDateRelative, VALIDATION_STEP_LABELS, cn } from '@/lib/utils';
import { GitBranch, CheckCircle2, XCircle, Clock, ChevronRight, User, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface PendingValidation {
  activity: Activity;
  currentStep: string;
  pendingSince: string;
}

const NEXT_STEP: Record<string, string> = {
  SOUMISSION:                'VERIFICATION_HIERARCHIQUE',
  VERIFICATION_HIERARCHIQUE: 'VALIDATION_TECHNIQUE',
  VALIDATION_TECHNIQUE:      'VALIDATION_ADMINISTRATIVE',
  VALIDATION_ADMINISTRATIVE: 'CLOTURE',
};

/* ─── step badge colors ────────────────────────────────────── */
const STEP_PILL: Record<string, string> = {
  SOUMISSION:                'bg-blue-50 text-blue-600',
  VERIFICATION_HIERARCHIQUE: 'bg-indigo-50 text-indigo-600',
  VALIDATION_TECHNIQUE:      'bg-violet-50 text-violet-600',
  VALIDATION_ADMINISTRATIVE: 'bg-purple-50 text-purple-600',
  CLOTURE:                   'bg-teal-50 text-teal-600',
};

/* ─── Page ─────────────────────────────────────────────────── */

export default function ValidationsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<PendingValidation | null>(null);
  const [form, setForm] = useState({ decision: 'APPROUVE', comment: '' });
  const [page, setPage] = useState(1);

  const limit = 30;

  const { data: pendingPage, isLoading } = useQuery({
    queryKey: ['validations-pending', page],
    queryFn: async () => {
      const r = await validationsApi.getPending({ page, limit });
      const response = r.data as any;

      // Double compatibilité : ancien format (tableau) ET nouveau format (objet)
      let resultData: any[] = [];
      let resultTotal = 0;

      if (Array.isArray(response)) {
        resultData = response;
        resultTotal = response.length;
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        resultData = response.data;
        resultTotal = response.total ?? response.data.length;
      }

      return {
        items: resultData.map(act => ({
          activity: act,
          currentStep: act.validations?.[0]?.step ?? 'SOUMISSION',
          pendingSince: act.validations?.[0]?.createdAt ?? act.createdAt,
        })),
        total: resultTotal,
      };
    },
    refetchInterval: 30_000,
  });
  // Guard défensif absolu
  const pending: PendingValidation[] = Array.isArray(pendingPage?.items) ? pendingPage.items : [];
  const totalPending = pendingPage?.total ?? 0;

  const { mutate: process, isPending: processing } = useMutation({
    mutationFn: () => {
      const toStep = form.decision === 'APPROUVE'
        ? NEXT_STEP[selected!.currentStep]
        : 'SOUMISSION';
      return validationsApi.transition(selected!.activity.id, { ...form, toStep });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['validations-pending'], exact: false });
      setSelected(null);
      setForm({ decision: 'APPROUVE', comment: '' });
    },
  });

  const urgentCount = pending.filter(p => {
    const d = p.activity?.dueDate ? new Date(p.activity.dueDate) : null;
    return d && d < new Date();
  }).length;

  const byStep = VALIDATION_STEP_LABELS
    ? Object.keys(VALIDATION_STEP_LABELS).map(step => ({
        step,
        label: VALIDATION_STEP_LABELS[step],
        count: pending.filter(p => p.currentStep === step).length,
      })).filter(s => s.count > 0)
    : [];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Validations"
        subtitle={
          totalPending > 0
            ? `${totalPending} en attente${urgentCount > 0 ? ` · ${urgentCount} urgente${urgentCount > 1 ? 's' : ''}` : ''}`
            : 'Aucune validation en attente'
        }
      />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { label: 'En attente', value: totalPending,  color: 'text-amber-600',  bg: 'bg-white border-slate-200' },
            { label: 'Urgentes',   value: urgentCount,     color: 'text-red-600',    bg: urgentCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200' },
            {
              label: 'Soumission',
              value: pending.filter(p => p.currentStep === 'SOUMISSION').length,
              color: 'text-blue-600',
              bg: 'bg-white border-slate-200',
            },
            {
              label: 'Vérification',
              value: pending.filter(p => p.currentStep === 'VERIFICATION_HIERARCHIQUE').length,
              color: 'text-indigo-600',
              bg: 'bg-white border-slate-200',
            },
          ].map(s => (
            <div key={s.label} className={cn('rounded-2xl border p-3 md:p-4 flex flex-col gap-1', s.bg)}>
              <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className={cn('text-2xl md:text-4xl font-bold tabular-nums', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Queue card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">File d'attente</p>
            {byStep.length > 0 && (
              <div className="flex items-center gap-2">
                {byStep.map(s => (
                  <span key={s.step} className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STEP_PILL[s.step] ?? 'bg-slate-100 text-slate-500')}>
                    {s.label} · {s.count}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              illustration="inbox"
              title="Aucune validation en attente"
              description="Toutes les activités soumises ont été traitées."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map(({ activity, currentStep, pendingSince }) => {
                const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date();
                return (
                  <div key={activity.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">

                        {/* Title + overdue badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Link
                            href={`/activities/${activity.id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-[#2563eb] truncate transition-colors"
                          >
                            {activity.title}
                          </Link>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">
                              <AlertTriangle size={10} />
                              En retard
                            </span>
                          )}
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          {/* Step badge */}
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STEP_PILL[currentStep] ?? 'bg-slate-100 text-slate-500')}>
                            {VALIDATION_STEP_LABELS[currentStep] ?? currentStep}
                          </span>

                          {pendingSince && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock size={11} />
                              <span>depuis {formatDateRelative(pendingSince)}</span>
                            </div>
                          )}

                          {activity.responsible && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <User size={11} />
                              <span>{activity.responsible.firstName} {activity.responsible.lastName}</span>
                            </div>
                          )}

                          {activity.dueDate && (
                            <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500')}>
                              <Calendar size={11} />
                              <span>{formatDate(activity.dueDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress + pipeline */}
                        <div className="flex items-center gap-4 flex-wrap">
                          <ProgressBar value={activity.completionRate} className="w-32" showLabel size="sm" />
                          <ValidationPipeline currentStep={currentStep} compact />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          icon={<CheckCircle2 size={14} />}
                          onClick={() => setSelected({ activity, currentStep, pendingSince })}
                        >
                          Traiter
                        </Button>
                        <Link href={`/activities/${activity.id}`}>
                          <Button size="sm" variant="secondary" icon={<ChevronRight size={14} />}>
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {totalPending > 10 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <Pagination page={page} total={totalPending} limit={limit} onChange={setPage} />
            </div>
          )}
        </div>
      </main>

      {/* Validate modal */}
      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setForm({ decision: 'APPROUVE', comment: '' }); }}
        title="Traiter la validation"
        size="sm"
      >
        {selected && (
          <form onSubmit={(e) => { e.preventDefault(); process(); }} className="space-y-4">
            {/* Activity recap */}
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Activité</p>
              <p className="text-sm font-semibold text-slate-900">{selected.activity.title}</p>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STEP_PILL[selected.currentStep] ?? 'bg-slate-100 text-slate-500')}>
                {VALIDATION_STEP_LABELS[selected.currentStep] ?? selected.currentStep}
              </span>
            </div>

            <FormField label="Décision">
              <Select value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}>
                <option value="APPROUVE">✓ Approuver — passer à l'étape suivante</option>
                <option value="REJETE">✕ Rejeter — retourner en soumission</option>
              </Select>
            </FormField>

            <FormField label={form.decision === 'REJETE' ? 'Motif du rejet *' : 'Commentaire (optionnel)'}>
              <Textarea
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                rows={3}
                placeholder={form.decision === 'REJETE' ? 'Expliquer la raison du rejet...' : 'Observations, remarques...'}
                required={form.decision === 'REJETE'}
              />
            </FormField>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setSelected(null)}>Annuler</Button>
              <Button
                type="submit"
                variant={form.decision === 'REJETE' ? 'danger' : 'primary'}
                isLoading={processing}
                icon={form.decision === 'APPROUVE' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              >
                {form.decision === 'APPROUVE' ? 'Approuver' : 'Rejeter'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
