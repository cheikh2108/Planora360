'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validationsApi } from '@/lib/api';
import type { Activity } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Select, Textarea } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ValidationPipeline } from '@/components/dashboard/validation-pipeline';
import { formatDate, VALIDATION_STEP_LABELS, cn } from '@/lib/utils';
import { GitBranch, CheckCircle2, XCircle, Clock, ChevronRight, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface PendingValidation {
  activity: Activity;
  currentStep: string;
  pendingSince: string;
}

export default function ValidationsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<PendingValidation | null>(null);
  const [form, setForm] = useState({ decision: 'APPROUVE', comment: '' });

  const { data: pending = [], isLoading } = useQuery<PendingValidation[]>({
    queryKey: ['validations-pending'],
    queryFn: async () => { const r = await validationsApi.getPending(); return r.data; },
    refetchInterval: 30_000,
  });

  const { mutate: process, isPending: processing } = useMutation({
    mutationFn: () => validationsApi.transition(selected!.activity.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['validations-pending'] });
      setSelected(null);
      setForm({ decision: 'APPROUVE', comment: '' });
    },
  });

  const urgentCount = pending.filter(p => {
    const d = p.activity.dueDate ? new Date(p.activity.dueDate) : null;
    return d && d < new Date();
  }).length;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Validations"
        subtitle={pending.length > 0 ? `${pending.length} en attente${urgentCount > 0 ? ` · ${urgentCount} urgentes` : ''}` : 'Aucune validation en attente'}
      />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'En attente', value: pending.length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Urgentes', value: urgentCount, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Soumission', value: pending.filter(p => p.currentStep === 'SOUMISSION').length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Vérification', value: pending.filter(p => p.currentStep === 'VERIFICATION_HIERARCHIQUE').length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-2xl border p-4', s.bg, 'border-transparent')}>
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">File d'attente</p>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon={GitBranch}
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
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Link
                            href={`/activities/${activity.id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-[#2563eb] truncate transition-colors"
                          >
                            {activity.title}
                          </Link>
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full shrink-0">
                              En retard
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>Étape : <span className="font-semibold text-slate-700">{VALIDATION_STEP_LABELS[currentStep] ?? currentStep}</span></span>
                          </div>
                          {activity.responsible && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <User size={12} />
                              <span>{activity.responsible.firstName} {activity.responsible.lastName}</span>
                            </div>
                          )}
                          {activity.dueDate && (
                            <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500')}>
                              <Calendar size={12} />
                              <span>{formatDate(activity.dueDate)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <ProgressBar value={activity.completionRate} className="w-32" showLabel size="sm" />
                          <ValidationPipeline currentStep={currentStep} compact />
                        </div>
                      </div>

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
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <p className="text-xs text-slate-500">Activité</p>
              <p className="text-sm font-semibold text-slate-900">{selected.activity.title}</p>
              <p className="text-xs text-slate-500">
                Étape : <span className="font-medium text-slate-700">{VALIDATION_STEP_LABELS[selected.currentStep] ?? selected.currentStep}</span>
              </p>
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
                loading={processing}
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
