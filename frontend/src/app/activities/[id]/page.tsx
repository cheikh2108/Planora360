'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi, checklistApi, validationsApi, budgetsApi } from '@/lib/api';
import type { Activity, ChecklistItem, Validation, Budget } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ValidationPipeline } from '@/components/dashboard/validation-pipeline';
import { formatDate, formatCurrency, PRIORITY_LABELS, PRIORITY_COLORS, VALIDATION_STEP_LABELS, cn } from '@/lib/utils';
import {
  ArrowLeft, Plus, CheckSquare, GitBranch, Wallet, Send,
  CheckCircle2, XCircle, Trash2, Calendar, User, AlertTriangle, Upload,
  FileText as FileTextIcon,
} from 'lucide-react';

const TABS = ['Checklist', 'Validation', 'Budget', 'Documents'] as const;
type Tab = typeof TABS[number];

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('Checklist');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', id] }),
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
      qc.invalidateQueries({ queryKey: ['activity', id] });
      qc.invalidateQueries({ queryKey: ['validations', id] });
    },
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
  const totalBudgetExecuted = budgets.reduce((s, b) => s + b.executed, 0);
  const budgetRate = totalBudgetPlanned > 0 ? Math.round((totalBudgetExecuted / totalBudgetPlanned) * 100) : 0;

  const lastValidation = validations[validations.length - 1];
  const completedSteps = validations.filter(v => v.decision === 'APPROUVE').map(v => v.step);

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
                <StatusBadge status={activity.status} dot />
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
                <p className="text-sm text-slate-600 mb-4">{activity.description}</p>
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
                  loading={submitting}
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
            activityId={id}
            qc={qc}
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
            totalExecuted={totalBudgetExecuted}
            rate={budgetRate}
            onAdd={() => setAddBudgetOpen(true)}
            isLocked={isLocked}
          />
        )}

        {tab === 'Documents' && (
          <DocumentsTab activityId={id} isLocked={isLocked} />
        )}
      </main>

      <AddChecklistItemModal open={addItemOpen} onClose={() => setAddItemOpen(false)} activityId={id} />
      <AddBudgetModal open={addBudgetOpen} onClose={() => setAddBudgetOpen(false)} activityId={id} />
      <ValidateModal open={validateOpen} onClose={() => setValidateOpen(false)} activityId={id} lastStep={lastValidation?.step} />
    </div>
  );
}

function ChecklistTab({
  items, isLocked, onUpdateProgress, onDelete, onAdd, activityId, qc,
}: {
  items: ChecklistItem[];
  isLocked: boolean;
  onUpdateProgress: (id: string, p: number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  activityId: string;
  qc: ReturnType<typeof useQueryClient>;
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
          icon={CheckSquare}
          title="Aucune tâche dans la checklist"
          description="Ajoutez des tâches obligatoires et facultatives pour structurer l'activité."
          action={!isLocked ? <Button icon={<Plus size={16} />} onClick={onAdd}>Ajouter une tâche</Button> : undefined}
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
          icon={GitBranch}
          title="Aucune validation"
          description="Le circuit de validation n'a pas encore été initié pour cette activité."
        />
      )}
    </div>
  );
}

function BudgetTab({
  budgets, totalPlanned, totalExecuted, rate, onAdd, isLocked,
}: {
  budgets: Budget[];
  totalPlanned: number;
  totalExecuted: number;
  rate: number;
  onAdd: () => void;
  isLocked: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Budget prévu', value: formatCurrency(totalPlanned), color: 'text-slate-900' },
          { label: 'Budget exécuté', value: formatCurrency(totalExecuted), color: 'text-green-600' },
          { label: 'Solde disponible', value: formatCurrency(totalPlanned - totalExecuted), color: 'text-blue-600' },
          { label: "Taux d'exécution", value: `${rate}%`, color: rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Budget lines */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aucune ligne budgétaire"
          description="Ajoutez des lignes budgétaires pour suivre les dépenses de cette activité."
          action={!isLocked ? <Button icon={<Plus size={16} />} onClick={onAdd}>Ajouter une ligne</Button> : undefined}
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
              loading={uploading}
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
        <EmptyState icon={FileTextIcon} title="Aucun document" description="Ajoutez des pièces justificatives, rapports, PV..." />
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
    mutationFn: () => checklistApi.create(activityId, form),
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
          <Button type="submit" loading={isPending}>Créer la tâche</Button>
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
          <Button type="submit" loading={isPending}>Enregistrer</Button>
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

  const { mutate, isPending } = useMutation({
    mutationFn: () => validationsApi.transition(activityId, form),
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
            loading={isPending}
            icon={form.decision === 'APPROUVE' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          >
            {form.decision === 'APPROUVE' ? 'Approuver' : 'Rejeter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
