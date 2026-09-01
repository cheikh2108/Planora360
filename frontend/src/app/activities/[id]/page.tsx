'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi, checklistApi, validationsApi, budgetsApi } from '@/lib/api';
import type { Activity, ActivityStatus, ChecklistItem, Validation, Budget } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ValidationPipeline } from '@/components/dashboard/validation-pipeline';
import { formatDate, formatCurrency, PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, VALIDATION_STEP_LABELS, cn } from '@/lib/utils';
import {
  ArrowLeft, Plus, CheckSquare, GitBranch, Wallet, Send,
  CheckCircle2, XCircle, Trash2, Calendar, User, AlertTriangle, Upload,
  FileText as FileTextIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const TABS = ['Checklist', 'Validation', 'Budget', 'Documents'] as const;
type Tab = typeof TABS[number];

const ALLOWED_TRANSITIONS: Partial<Record<ActivityStatus, ActivityStatus[]>> = {
  NON_DEMARREE: ['EN_PREPARATION', 'ANNULEE'],
  EN_PREPARATION: ['EN_COURS', 'ANNULEE'],
  EN_COURS: ['EN_ATTENTE', 'SUSPENDUE', 'TERMINEE'],
  EN_ATTENTE: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
  SUSPENDUE: ['EN_COURS', 'ANNULEE'],
  EN_RETARD: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
};

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('Checklist');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [recordCommittedOpen, setRecordCommittedOpen] = useState(false);
  const [recordExecutedOpen, setRecordExecutedOpen] = useState(false);
  const [validateOpen, setValidateOpen] = useState(false);

  const { data: activity, isLoading } = useQuery<Activity>({
    queryKey: ['activity', id],
    queryFn: async () => { const r = await activitiesApi.get(id); return r.data; },
  });

  const { data: checklist = [] } = useQuery<ChecklistItem[]>({
    queryKey: ['checklist', id],
    queryFn: async () => { const r = await checklistApi.list(id); return r.data; },
    enabled: tab === 'Checklist',
  });

  const { data: validations = [] } = useQuery<Validation[]>({
    queryKey: ['validations', id],
    queryFn: async () => { const r = await validationsApi.getCurrent(id); return r.data; },
    enabled: tab === 'Validation',
  });

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ['budgets', id],
    queryFn: async () => { const r = await budgetsApi.list(id); return r.data; },
    enabled: tab === 'Budget',
  });

  const { mutate: updateProgress } = useMutation({
    mutationFn: ({ itemId, progress }: { itemId: string; progress: number }) =>
      checklistApi.update(id, itemId, { progress }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', id] });
      qc.invalidateQueries({ queryKey: ['activity', id] });
    },
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: (itemId: string) => checklistApi.delete(id, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', id] });
      qc.invalidateQueries({ queryKey: ['activity', id] });
    },
  });

  const { mutate: submit, isPending: submitting } = useMutation({
    mutationFn: () => validationsApi.submit(id),
    onSuccess: () => {
      toast.success('Soumis pour validation', 'L\'activité est en attente d\'approbation.');
      qc.invalidateQueries({ queryKey: ['activity', id] });
      qc.invalidateQueries({ queryKey: ['validations', id] });
    },
    onError: () => toast.error('Erreur', 'Impossible de soumettre pour validation.'),
  });

  const { mutate: changeStatus, isPending: changingStatus } = useMutation({
    mutationFn: (status: string) => activitiesApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Statut mis à jour');
      qc.invalidateQueries({ queryKey: ['activity', id] });
    },
    onError: () => toast.error('Erreur', 'Impossible de modifier le statut.'),
  });

  if (isLoading || !activity) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <Header title="Chargement..." />
        <main className="px-4 md:px-6 py-6">
          <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        </main>
      </div>
    );
  }

  const isLocked = activity.status === 'VALIDEE' || activity.status === 'ANNULEE';
  const canSubmit = activity.status === 'TERMINEE' && activity.completionRate >= 100;

  const totalBudgetPlanned = budgets.reduce((s, b) => s + b.planned, 0);
  const totalBudgetCommitted = budgets.reduce((s, b) => s + b.committed, 0);
  const totalBudgetExecuted = budgets.reduce((s, b) => s + b.executed, 0);
  const budgetRate = totalBudgetPlanned > 0 ? Math.round((totalBudgetExecuted / totalBudgetPlanned) * 100) : 0;
  const availableBalance = totalBudgetPlanned - totalBudgetCommitted;
  const remainingToPay = totalBudgetCommitted - totalBudgetExecuted;

  const validationList = Array.isArray(validations) ? validations : [];
  const lastValidation = validationList[validationList.length - 1];
  const completedSteps = validationList.filter(v => v.decision === 'APPROUVE').map(v => v.step);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title={activity.title} subtitle={activity.axis?.actionPlan?.title} />
      <main className="px-4 md:px-6 py-6 space-y-5">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Activity header card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-3">
                {isLocked ? (
                  <StatusBadge status={activity.status} dot />
                ) : (
                  <select
                    value={activity.status}
                    disabled={changingStatus}
                    onChange={e => changeStatus(e.target.value)}
                    className="text-xs font-semibold rounded-full px-3 py-1 border border-slate-200 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 disabled:opacity-50"
                  >
                    <option value={activity.status}>{STATUS_LABELS[activity.status]}</option>
                    {ALLOWED_TRANSITIONS[activity.status]?.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                )}
                <span className={cn('text-xs font-semibold', PRIORITY_COLORS[activity.priority])}>
                  Priorité {PRIORITY_LABELS[activity.priority]}
                </span>
                {isLocked && (
                  <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={10} /> Verrouillée
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">{activity.title}</h1>
              {activity.description && (
                <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
              )}
              {activity.expectedResults && (
                <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-500 mb-1">Résultats attendus</p>
                  <p className="text-sm text-teal-800">{activity.expectedResults}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                {activity.responsible && (
                  <div className="flex items-center gap-1.5">
                    <User size={13} />
                    <span>{activity.responsible.firstName} {activity.responsible.lastName}</span>
                  </div>
                )}
                {activity.startDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>Début : {formatDate(activity.startDate)}</span>
                  </div>
                )}
                {activity.dueDate && (
                  <div className={cn('flex items-center gap-1.5', activity.status === 'EN_RETARD' && 'text-red-600 font-semibold')}>
                    <Calendar size={13} />
                    <span>Échéance : {formatDate(activity.dueDate)}</span>
                  </div>
                )}
                {activity.collaborators && activity.collaborators.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <User size={13} />
                    <span className="text-slate-400">Collaborateurs :</span>
                    {activity.collaborators.map(c => (
                      <span key={c.id} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">
                        {c.user.firstName} {c.user.lastName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Taux de complétion</p>
                <p className="text-3xl font-bold text-slate-900">{activity.completionRate}%</p>
              </div>
              <ProgressBar value={activity.completionRate} className="w-40" size="md" showLabel={false} />
              {canSubmit && (
                <Button
                  icon={<Send size={14} />}
                  isLoading={submitting}
                  onClick={() => submit()}
                  size="sm"
                >
                  Soumettre au circuit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t ? 'bg-[#0f1e38] text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'Checklist' && (
          <ChecklistTab
            items={checklist}
            isLocked={isLocked}
            onUpdateProgress={(itemId, progress) => updateProgress({ itemId, progress })}
            onDelete={deleteItem}
            onAdd={() => setAddItemOpen(true)}
          />
        )}

        {tab === 'Validation' && (
          <ValidationTab
            validations={validations}
            completedSteps={completedSteps}
            currentStep={lastValidation?.step}
            onValidate={() => setValidateOpen(true)}
            activityStatus={activity.status}
          />
        )}

        {tab === 'Budget' && (
          <BudgetTab
            budgets={budgets}
            totalPlanned={totalBudgetPlanned}
            totalCommitted={totalBudgetCommitted}
            totalExecuted={totalBudgetExecuted}
            availableBalance={availableBalance}
            remainingToPay={remainingToPay}
            rate={budgetRate}
            onAdd={() => setAddBudgetOpen(true)}
            onRecordCommitted={() => setRecordCommittedOpen(true)}
            onRecordExecuted={() => setRecordExecutedOpen(true)}
            isLocked={isLocked}
          />
        )}

        {tab === 'Documents' && (
          <DocumentsTab activityId={id} isLocked={isLocked} />
        )}
      </main>

      <AddChecklistItemModal open={addItemOpen} onClose={() => setAddItemOpen(false)} activityId={id} />
      <AddBudgetModal open={addBudgetOpen} onClose={() => setAddBudgetOpen(false)} activityId={id} />
      <RecordCommittedBudgetModal open={recordCommittedOpen} onClose={() => setRecordCommittedOpen(false)} activityId={id} budgets={budgets} />
      <RecordExecutedBudgetModal open={recordExecutedOpen} onClose={() => setRecordExecutedOpen(false)} activityId={id} budgets={budgets} />
      <ValidateModal open={validateOpen} onClose={() => setValidateOpen(false)} activityId={id} lastStep={lastValidation?.step} />
    </div>
  );
}

function ChecklistTab({
  items, isLocked, onUpdateProgress, onDelete, onAdd,
}: {
  items: ChecklistItem[];
  isLocked: boolean;
  onUpdateProgress: (id: string, p: number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const mandatory = items.filter(i => i.isMandatory);
  const optional = items.filter(i => !i.isMandatory);

  const ItemRow = ({ item }: { item: ChecklistItem }) => (
    <div className={cn(
      'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
      item.progress === 100 ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
    )}>
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
        item.progress === 100 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
      )}>
        {item.progress === 100 ? <CheckCircle2 size={14} /> : <span className="text-xs font-bold">{item.progress}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', item.progress === 100 && 'line-through text-slate-400')}>
          {item.label}
        </p>
        {item.dueDate && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Calendar size={10} /> {formatDate(item.dueDate)}
          </p>
        )}
      </div>
      {!isLocked && (
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={item.progress}
            onChange={e => onUpdateProgress(item.id, Number(e.target.value))}
            className="h-7 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          >
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
              <option key={v} value={v}>{v}%</option>
            ))}
          </select>
          <button onClick={() => onDelete(item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {items.length === 0 ? (
        <EmptyState
          illustration="inbox"
          title="Aucune tâche dans la checklist"
          description="Ajoutez des tâches obligatoires et facultatives pour structurer l'activité."
          action={!isLocked ? { label: 'Ajouter une tâche', onClick: onAdd, leftIcon: <Plus size={16} /> } : undefined}
        />
      ) : (
        <>
          {mandatory.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Tâches obligatoires — {mandatory.filter(i => i.progress === 100).length}/{mandatory.length}
              </p>
              <div className="space-y-2">
                {mandatory.map(item => <ItemRow key={item.id} item={item} />)}
              </div>
            </div>
          )}
          {optional.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Tâches facultatives — {optional.filter(i => i.progress === 100).length}/{optional.length}
              </p>
              <div className="space-y-2">
                {optional.map(item => <ItemRow key={item.id} item={item} />)}
              </div>
            </div>
          )}
          {!isLocked && (
            <Button variant="secondary" icon={<Plus size={16} />} onClick={onAdd}>
              Ajouter une tâche
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function ValidationTab({
  validations, completedSteps, currentStep, onValidate, activityStatus,
}: {
  validations: Validation[];
  completedSteps: string[];
  currentStep?: string;
  onValidate: () => void;
  activityStatus: string;
}) {
  const canValidate = activityStatus !== 'VALIDEE' && activityStatus !== 'ANNULEE' && currentStep && currentStep !== 'CLOTURE';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
        <p className="text-sm font-semibold text-slate-700 mb-5">État du circuit de validation</p>
        <ValidationPipeline
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {canValidate && (
        <div className="flex justify-end">
          <Button icon={<CheckCircle2 size={16} />} onClick={onValidate}>
            Traiter l'étape courante
          </Button>
        </div>
      )}

      {validations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Historique des validations</p>
          </div>
          <div className="divide-y divide-slate-100">
            {validations.map(v => (
              <div key={v.id} className="px-5 py-4 flex items-start gap-3">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                  v.decision === 'APPROUVE' ? 'bg-green-100 text-green-600' :
                  v.decision === 'REJETE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                )}>
                  {v.decision === 'APPROUVE' ? <CheckCircle2 size={14} /> :
                   v.decision === 'REJETE' ? <XCircle size={14} /> : <GitBranch size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">
                      {VALIDATION_STEP_LABELS[v.step] ?? v.step}
                    </span>
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      v.decision === 'APPROUVE' ? 'bg-green-100 text-green-700' :
                      v.decision === 'REJETE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {v.decision === 'APPROUVE' ? 'Approuvé' : v.decision === 'REJETE' ? 'Rejeté' : 'En attente'}
                    </span>
                  </div>
                  {v.validator && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Par {v.validator.firstName} {v.validator.lastName} · {formatDate(v.createdAt)}
                    </p>
                  )}
                  {v.comment && <p className="text-xs text-slate-600 mt-1 italic">"{v.comment}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {validations.length === 0 && (
        <EmptyState
          illustration="inbox"
          title="Aucune validation"
          description="Le circuit de validation n'a pas encore été initié pour cette activité."
        />
      )}
    </div>
  );
}

function BudgetTab({
  budgets, totalPlanned, totalCommitted, totalExecuted, availableBalance, remainingToPay, rate, onAdd, onRecordCommitted, onRecordExecuted, isLocked,
}: {
  budgets: Budget[];
  totalPlanned: number;
  totalCommitted: number;
  totalExecuted: number;
  availableBalance: number;
  remainingToPay: number;
  rate: number;
  onAdd: () => void;
  onRecordCommitted: () => void;
  onRecordExecuted: () => void;
  isLocked: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Action buttons */}
      {!isLocked && budgets.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="secondary"
            icon={<Wallet size={14} />}
            onClick={onRecordCommitted}
          >
            Enregistrer budget engagé
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<FileTextIcon size={14} />}
            onClick={onRecordExecuted}
          >
            Enregistrer budget exécuté
          </Button>
        </div>
      )}

      {/* Summary - Logique en cascade */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0f1e38] text-white rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-1">Prévu</p>
          <p className="text-xl font-bold tabular-nums">{formatCurrency(totalPlanned)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Engagé</p>
          <p className="text-xl font-bold tabular-nums text-blue-600">{formatCurrency(totalCommitted)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Disponible</p>
          <p className="text-xl font-bold tabular-nums text-indigo-600">{formatCurrency(availableBalance)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Prévu - Engagé</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Exécuté</p>
          <p className="text-xl font-bold tabular-nums text-green-600">{formatCurrency(totalExecuted)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Reste à payer</p>
          <p className="text-xl font-bold tabular-nums text-orange-600">{formatCurrency(remainingToPay)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Engagé - Exécuté</p>
        </div>
        <div className={cn(
          'rounded-2xl border p-4',
          rate >= 80 ? 'bg-green-50 border-green-200' : rate >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
        )}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Taux exéc.</p>
          <p className={cn(
            'text-xl font-bold tabular-nums',
            rate >= 80 ? 'text-green-700' : rate >= 50 ? 'text-amber-700' : 'text-red-700'
          )}>{rate}%</p>
        </div>
      </div>

      {/* Budget lines */}
      {budgets.length === 0 ? (
        <EmptyState
          illustration="data"
          title="Aucune ligne budgétaire"
          description="Ajoutez des lignes budgétaires pour suivre les dépenses de cette activité."
          action={!isLocked ? { label: 'Ajouter une ligne', onClick: onAdd, leftIcon: <Plus size={16} /> } : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Lignes budgétaires</p>
            {!isLocked && <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={onAdd}>Ajouter</Button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Source de financement</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Prévu</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Engagé</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Décaissé</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Exécuté</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Taux</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map(b => {
                  const r = b.planned > 0 ? Math.round((b.executed / b.planned) * 100) : 0;
                  return (
                    <tr key={b.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 text-sm text-slate-900">{b.fundingSource ?? 'Non spécifié'}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-700">{formatCurrency(b.planned)}</td>
                      <td className="px-4 py-3 text-sm text-right text-blue-600 hidden sm:table-cell">{formatCurrency(b.committed)}</td>
                      <td className="px-4 py-3 text-sm text-right text-indigo-600 hidden sm:table-cell">{formatCurrency(b.disbursed)}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">{formatCurrency(b.executed)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('text-xs font-semibold', r >= 80 ? 'text-green-600' : r >= 50 ? 'text-amber-600' : 'text-red-600')}>
                          {r}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ activityId, isLocked }: { activityId: string; isLocked: boolean }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('RAPPORT');

  const { data: docs = [], isLoading } = useQuery<Array<{ id: string; fileName: string; type: string; createdAt: string; uploadedBy?: { firstName: string; lastName: string } }>>({
    queryKey: ['documents-activity', activityId],
    queryFn: async () => { const r = await import('@/lib/api').then(m => m.default.get(`/activities/${activityId}/documents`)); return r.data; },
  });

  const { mutate: deleteDoc } = useMutation({
    mutationFn: (docId: string) => import('@/lib/api').then(m => m.default.delete(`/documents/${docId}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents-activity', activityId] }),
  });

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const apiModule = await import('@/lib/api');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', docType);
      await apiModule.default.post(`/activities/${activityId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      qc.invalidateQueries({ queryKey: ['documents-activity', activityId] });
    } finally {
      setUploading(false);
    }
  }

  const DOC_TYPES = ['TDR', 'BUDGET', 'CONTRAT', 'LISTE_PRESENCE', 'RAPPORT', 'PV', 'FACTURE', 'PHOTO', 'LIVRABLE', 'VALIDATION', 'AUTRE'];

  return (
    <div className="space-y-4">
      {!isLocked && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
            >
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Button
              size="sm"
              variant="secondary"
              isLoading={uploading}
              icon={<Upload size={13} />}
              onClick={() => inputRef.current?.click()}
            >
              Ajouter un document
            </Button>
            <input ref={inputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : docs.length === 0 ? (
        <EmptyState illustration="document" title="Aucun document" description="Ajoutez des pièces justificatives, rapports, PV..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 group transition-colors">
              <FileTextIcon size={18} className="text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{doc.fileName}</p>
                <p className="text-xs text-slate-400">{formatDate(doc.createdAt)}{doc.uploadedBy && ` · ${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}`}</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hidden sm:inline-flex">{doc.type}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isLocked && (
                  <button onClick={() => deleteDoc(doc.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddChecklistItemModal({ open, onClose, activityId }: { open: boolean; onClose: () => void; activityId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ label: '', isMandatory: true, dueDate: '' });

  const { mutate, isPending } = useMutation({
    mutationFn: () => checklistApi.create(activityId, { ...form, dueDate: form.dueDate || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', activityId] });
      qc.invalidateQueries({ queryKey: ['activity', activityId] });
      onClose();
      setForm({ label: '', isMandatory: true, dueDate: '' });
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle tâche checklist" size="sm">
      <form onSubmit={(e) => { e.preventDefault(); if (form.label.trim()) mutate(); }} className="space-y-4">
        <FormField label="Libellé" required>
          <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Description de la tâche" autoFocus />
        </FormField>
        <FormField label="Type">
          <Select
            value={form.isMandatory ? 'true' : 'false'}
            onChange={e => setForm(f => ({ ...f, isMandatory: e.target.value === 'true' }))}
          >
            <option value="true">Obligatoire</option>
            <option value="false">Facultative</option>
          </Select>
        </FormField>
        <FormField label="Échéance">
          <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </FormField>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isPending}>Créer la tâche</Button>
        </div>
      </form>
    </Modal>
  );
}

function AddBudgetModal({ open, onClose, activityId }: { open: boolean; onClose: () => void; activityId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ planned: '', committed: '0', disbursed: '0', executed: '0', fundingSource: '' });

  const { mutate, isPending } = useMutation({
    mutationFn: () => budgetsApi.create(activityId, {
      planned: Number(form.planned),
      committed: Number(form.committed),
      disbursed: Number(form.disbursed),
      executed: Number(form.executed),
      fundingSource: form.fundingSource || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets', activityId] });
      onClose();
      setForm({ planned: '', committed: '0', disbursed: '0', executed: '0', fundingSource: '' });
    },
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle ligne budgétaire" size="md">
      <form onSubmit={(e) => { e.preventDefault(); if (form.planned) mutate(); }} className="space-y-4">
        <FormField label="Source de financement">
          <Input value={form.fundingSource} onChange={set('fundingSource')} placeholder="Ex: Subvention UE, Budget propre..." />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Montant prévu (FCFA)" required>
            <Input type="number" value={form.planned} onChange={set('planned')} placeholder="0" min="0" />
          </FormField>
          <FormField label="Montant engagé">
            <Input type="number" value={form.committed} onChange={set('committed')} placeholder="0" min="0" />
          </FormField>
          <FormField label="Montant décaissé">
            <Input type="number" value={form.disbursed} onChange={set('disbursed')} placeholder="0" min="0" />
          </FormField>
          <FormField label="Montant exécuté">
            <Input type="number" value={form.executed} onChange={set('executed')} placeholder="0" min="0" />
          </FormField>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isPending}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}

function ValidateModal({ open, onClose, activityId, lastStep }: {
  open: boolean; onClose: () => void; activityId: string; lastStep?: string;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ decision: 'APPROUVE', comment: '' });

  const NEXT_STEP: Record<string, string> = {
    SOUMISSION:                'VERIFICATION_HIERARCHIQUE',
    VERIFICATION_HIERARCHIQUE: 'VALIDATION_TECHNIQUE',
    VALIDATION_TECHNIQUE:      'VALIDATION_ADMINISTRATIVE',
    VALIDATION_ADMINISTRATIVE: 'CLOTURE',
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const toStep = form.decision === 'APPROUVE'
        ? (lastStep ? NEXT_STEP[lastStep] : 'VERIFICATION_HIERARCHIQUE')
        : 'SOUMISSION';
      return validationsApi.transition(activityId, { ...form, toStep });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['validations', activityId] });
      qc.invalidateQueries({ queryKey: ['activity', activityId] });
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Traiter la validation" size="sm">
      <form onSubmit={(e) => { e.preventDefault(); mutate(); }} className="space-y-4">
        {lastStep && (
          <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500">
            Étape courante : <span className="font-semibold text-slate-700">{VALIDATION_STEP_LABELS[lastStep] ?? lastStep}</span>
          </div>
        )}
        <FormField label="Décision">
          <Select value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}>
            <option value="APPROUVE">Approuver</option>
            <option value="REJETE">Rejeter</option>
          </Select>
        </FormField>
        <FormField label="Commentaire">
          <Textarea
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            rows={3}
            placeholder="Motif de la décision..."
          />
        </FormField>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button
            type="submit"
            variant={form.decision === 'REJETE' ? 'danger' : 'primary'}
            isLoading={isPending}
            icon={form.decision === 'APPROUVE' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          >
            {form.decision === 'APPROUVE' ? 'Approuver' : 'Rejeter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function RecordCommittedBudgetModal({
  open, onClose, activityId, budgets,
}: {
  open: boolean;
  onClose: () => void;
  activityId: string;
  budgets: Budget[];
}) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [amount, setAmount] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedBudgetId || !amount) throw new Error('Champs requis');

      const budget = budgets.find(b => b.id === selectedBudgetId);
      if (!budget) throw new Error('Budget introuvable');

      // 1. Mettre à jour le budget
      await budgetsApi.update(selectedBudgetId, {
        committed: Number(budget.committed) + Number(amount),
      });

      // 2. Uploader les documents justificatifs si présents
      if (files.length > 0) {
        setUploadingDocs(true);
        for (const file of files) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('type', 'ENGAGEMENT');
          fd.append('activityId', activityId);
          await (await import('@/lib/api')).default.post('/documents/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }
    },
    onSuccess: () => {
      toast.success('Budget engagé enregistré', 'Les documents justificatifs ont été ajoutés.');
      qc.invalidateQueries({ queryKey: ['budgets', activityId] });
      qc.invalidateQueries({ queryKey: ['documents-activity', activityId] });
      onClose();
      setSelectedBudgetId('');
      setAmount('');
      setFiles([]);
      setUploadingDocs(false);
    },
    onError: () => {
      toast.error('Erreur', 'Impossible d\'enregistrer le budget engagé.');
      setUploadingDocs(false);
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  return (
    <Modal open={open} onClose={onClose} title="Enregistrer budget engagé" size="md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="space-y-4"
      >
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-sm text-blue-800">
            <strong>Budget engagé</strong> : montant réservé ou contractuellement engagé pour cette activité.
          </p>
        </div>

        <FormField label="Ligne budgétaire" required>
          <Select
            value={selectedBudgetId}
            onChange={(e) => setSelectedBudgetId(e.target.value)}
            required
          >
            <option value="">Sélectionner une ligne</option>
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.fundingSource || 'Non spécifié'} - Prévu: {formatCurrency(b.planned)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Montant engagé (FCFA)" required>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </FormField>

        <FormField label="Documents justificatifs">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Ajouter des fichiers
          </Button>
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-slate-700 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormField>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            isLoading={isPending || uploadingDocs}
            disabled={!selectedBudgetId || !amount}
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function RecordExecutedBudgetModal({
  open, onClose, activityId, budgets,
}: {
  open: boolean;
  onClose: () => void;
  activityId: string;
  budgets: Budget[];
}) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [amount, setAmount] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedBudgetId || !amount) throw new Error('Champs requis');

      const budget = budgets.find(b => b.id === selectedBudgetId);
      if (!budget) throw new Error('Budget introuvable');

      // 1. Mettre à jour le budget
      await budgetsApi.update(selectedBudgetId, {
        executed: Number(budget.executed) + Number(amount),
      });

      // 2. Uploader les documents justificatifs (factures, etc.) si présents
      if (files.length > 0) {
        setUploadingDocs(true);
        for (const file of files) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('type', 'FACTURE');
          fd.append('activityId', activityId);
          await (await import('@/lib/api')).default.post('/documents/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }
    },
    onSuccess: () => {
      toast.success('Budget exécuté enregistré', 'Les factures et justificatifs ont été ajoutés.');
      qc.invalidateQueries({ queryKey: ['budgets', activityId] });
      qc.invalidateQueries({ queryKey: ['documents-activity', activityId] });
      onClose();
      setSelectedBudgetId('');
      setAmount('');
      setFiles([]);
      setUploadingDocs(false);
    },
    onError: () => {
      toast.error('Erreur', 'Impossible d\'enregistrer le budget exécuté.');
      setUploadingDocs(false);
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  return (
    <Modal open={open} onClose={onClose} title="Enregistrer budget exécuté" size="md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="space-y-4"
      >
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <p className="text-sm text-green-800">
            <strong>Budget exécuté</strong> : dépenses effectivement réalisées avec justificatifs
            (factures, reçus, etc.).
          </p>
        </div>

        <FormField label="Ligne budgétaire" required>
          <Select
            value={selectedBudgetId}
            onChange={(e) => setSelectedBudgetId(e.target.value)}
            required
          >
            <option value="">Sélectionner une ligne</option>
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.fundingSource || 'Non spécifié'} - Prévu: {formatCurrency(b.planned)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Montant exécuté (FCFA)" required>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </FormField>

        <FormField label="Justificatifs (factures, reçus...)">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Ajouter des fichiers
          </Button>
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="text-slate-700 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormField>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            isLoading={isPending || uploadingDocs}
            disabled={!selectedBudgetId || !amount}
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
