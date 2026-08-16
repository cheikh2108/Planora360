'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, activitiesApi, plansApi } from '@/lib/api';
import type { DashboardOverview, Activity, ActionPlan } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { HelpButton } from '@/components/help/help-button';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ActivityStatusChart } from '@/components/dashboard/activity-status-chart';
import { BudgetChart } from '@/components/dashboard/budget-chart';
import { ValidationPipeline } from '@/components/dashboard/validation-pipeline';
import { ActivityRow } from '@/components/dashboard/activity-row';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { AuditFeed } from '@/components/dashboard/audit-feed';
import { KpiSkeleton, Skeleton } from '@/components/ui/skeleton';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, PRIORITY_COLORS, PRIORITY_LABELS, cn } from '@/lib/utils';
import {
  Activity as ActivityIcon, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Wallet, GitBranch, CalendarClock, Filter,
  Users, Target, ShieldAlert, ChevronRight, BarChart3,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Filtres globaux ─────────────────────────────────────────── */

interface Filters {
  planId: string;
  period: 'all' | 'month' | 'quarter' | 'year';
  status: string;
}

function FilterBar({
  filters, onChange, plans,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  plans: ActionPlan[];
}) {
  const PERIODS = [
    { value: 'all', label: 'Toute la période' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
  ] as const;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={14} className="text-slate-400 shrink-0" />
      {/* Plan */}
      <select
        value={filters.planId}
        onChange={e => onChange({ ...filters, planId: e.target.value })}
        className="h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
      >
        <option value="">Tous les plans</option>
        {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
      {/* Période */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-x-auto">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => onChange({ ...filters, period: p.value })}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
              filters.period === p.value ? 'bg-[#0f1e38] text-white' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Statut */}
      <select
        value={filters.status}
        onChange={e => onChange({ ...filters, status: e.target.value })}
        className="h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
      >
        <option value="">Tous statuts</option>
        <option value="EN_RETARD">En retard</option>
        <option value="EN_COURS">En cours</option>
        <option value="EN_PREPARATION">En préparation</option>
        <option value="TERMINEE">Terminées</option>
        <option value="VALIDEE">Validées</option>
      </select>
    </div>
  );
}

/* ─── Performance par responsable ───────────────────────────────── */

interface PerfEntry {
  userId: string;
  name: string;
  total: number;
  completed: number;
  overdue: number;
  avgCompletionRate: number;
}

function PerformanceByResponsable({ data }: { data: PerfEntry[] }) {
  if (!data?.length) return (
    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
      Aucune donnée de performance
    </div>
  );
  return (
    <div className="space-y-3">
      {data.slice(0, 6).map(entry => (
        <div key={entry.userId} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#0f1e38]/10 flex items-center justify-center text-xs font-bold text-[#0f1e38] shrink-0">
            {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-900 truncate">{entry.name}</p>
              <span className="text-xs font-bold text-slate-700 ml-2 shrink-0">{entry.avgCompletionRate}%</span>
            </div>
            <ProgressBar value={entry.avgCompletionRate} size="sm" />
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-slate-500">{entry.completed}/{entry.total}</span>
            {entry.overdue > 0 && (
              <span className="text-red-500 font-semibold">{entry.overdue} retard{entry.overdue > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Activités critiques ────────────────────────────────────────── */

function CriticalActivities({ activities }: { activities: Activity[] }) {
  const critical = activities
    .filter(a => (a.priority === 'CRITIQUE' || a.priority === 'HAUTE') && a.status !== 'VALIDEE' && a.status !== 'ANNULEE')
    .sort((a, b) => {
      const priorityScore = { CRITIQUE: 2, HAUTE: 1, NORMALE: 0, BASSE: -1 } as Record<string, number>;
      return (priorityScore[b.priority] ?? 0) - (priorityScore[a.priority] ?? 0);
    })
    .slice(0, 5);

  if (!critical.length) return (
    <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
      <CheckCircle2 size={22} className="text-green-400" />
      <p className="text-sm">Aucune activité critique</p>
    </div>
  );

  return (
    <ul className="divide-y divide-slate-100">
      {critical.map(act => (
        <li key={act.id}>
          <Link href={`/activities/${act.id}`} className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-5 px-5 transition-colors group">
            <div className={cn(
              'w-1.5 h-8 rounded-full shrink-0',
              act.priority === 'CRITIQUE' ? 'bg-red-500' : 'bg-amber-400'
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#2563eb] transition-colors">
                {act.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={act.status} />
                <span className={cn('text-xs font-semibold', PRIORITY_COLORS[act.priority])}>
                  {PRIORITY_LABELS[act.priority]}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-slate-900">{act.completionRate}%</p>
              {act.dueDate && (
                <p className={cn('text-xs', act.status === 'EN_RETARD' ? 'text-red-500 font-semibold' : 'text-slate-400')}>
                  {formatDate(act.dueDate)}
                </p>
              )}
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-[#2563eb] shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ─── Risques et blocages ────────────────────────────────────────── */

function RisksAndBlockers({ activities }: { activities: Activity[] }) {
  const blockers = activities.filter(a =>
    a.status === 'EN_RETARD' ||
    a.status === 'EN_ATTENTE' ||
    a.status === 'SUSPENDUE' ||
    (a.status === 'EN_COURS' && a.completionRate < 20 && a.dueDate && new Date(a.dueDate) < new Date(Date.now() + 7 * 86400000))
  ).slice(0, 5);

  const riskLabel = (act: Activity) => {
    if (act.status === 'EN_RETARD') return { label: 'En retard', color: 'bg-red-100 text-red-700' };
    if (act.status === 'SUSPENDUE') return { label: 'Suspendue', color: 'bg-orange-100 text-orange-700' };
    if (act.status === 'EN_ATTENTE') return { label: 'Bloquée', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Risque délai', color: 'bg-yellow-100 text-yellow-700' };
  };

  if (!blockers.length) return (
    <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
      <CheckCircle2 size={22} className="text-green-400" />
      <p className="text-sm">Aucun risque identifié</p>
    </div>
  );

  return (
    <ul className="divide-y divide-slate-100">
      {blockers.map(act => {
        const risk = riskLabel(act);
        return (
          <li key={act.id}>
            <Link href={`/activities/${act.id}`} className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-5 px-5 transition-colors group">
              <ShieldAlert size={15} className="text-red-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#2563eb]">{act.title}</p>
                <p className="text-xs text-slate-400 truncate">
                  {act.axis?.actionPlan?.title} › {act.axis?.title}
                </p>
              </div>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', risk.color)}>
                {risk.label}
              </span>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-[#2563eb] shrink-0" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ─── Résultats vs cibles ────────────────────────────────────────── */

function ResultsVsTargets({ activities }: { activities: Activity[] }) {
  // Aggrège par statut pour donner une vue résultats/cibles
  const total = activities.length;
  const validee = activities.filter(a => a.status === 'VALIDEE').length;
  const terminee = activities.filter(a => a.status === 'TERMINEE').length;
  const enCours = activities.filter(a => a.status === 'EN_COURS' || a.status === 'EN_PREPARATION').length;
  const retard = activities.filter(a => a.status === 'EN_RETARD').length;

  const targetCompletion = total > 0 ? Math.round(((validee + terminee) / total) * 100) : 0;
  const avgCompletion = total > 0
    ? Math.round(activities.reduce((s, a) => s + a.completionRate, 0) / total)
    : 0;

  const metrics = [
    { label: 'Activités validées', achieved: validee, target: total, unit: '', color: 'bg-green-500' },
    { label: 'Taux de complétion moyen', achieved: avgCompletion, target: 100, unit: '%', color: 'bg-blue-500' },
    { label: 'Activités terminées', achieved: terminee + validee, target: total, unit: '', color: 'bg-teal-500' },
    { label: 'En retard', achieved: retard, target: 0, unit: '', color: 'bg-red-500', inverse: true },
  ];

  return (
    <div className="space-y-4">
      {metrics.map(m => {
        const pct = m.target > 0 ? Math.min(100, Math.round((m.achieved / m.target) * 100)) : 0;
        const isGood = m.inverse ? m.achieved === 0 : pct >= 80;
        const isMid = !m.inverse && pct >= 50 && pct < 80;
        return (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-slate-600">{m.label}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">
                  {m.achieved}{m.unit}
                </span>
                {m.target > 0 && !m.inverse && (
                  <span className="text-xs text-slate-400">/ {m.target}{m.unit}</span>
                )}
                <span className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded-full',
                  isGood ? 'bg-green-100 text-green-700' :
                  isMid ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {m.inverse ? (m.achieved === 0 ? '✓ OK' : `⚠ ${m.achieved}`) : `${pct}%`}
                </span>
              </div>
            </div>
            {!m.inverse && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', m.color)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({ planId: '', period: 'all', status: '' });

  const { data: plans = [] } = useQuery<ActionPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => { const r = await plansApi.list({ limit: 1000 }); return (r.data as any).data ?? []; },
  });

  const { data: overview, isLoading: loadingOverview } = useQuery<DashboardOverview>({
    queryKey: ['dashboard-overview', filters.planId],
    queryFn: async () => {
      const r = await dashboardApi.getOverview();
      const d = r.data as any;
      return {
        ...d,
        totalActivities:    d.activities?.total          ?? d.totalActivities    ?? 0,
        pendingValidations: d.activities?.pendingValidations ?? d.pendingValidations ?? 0,
        overdueActivities:  d.activities?.overdue        ?? d.overdueActivities  ?? 0,
        completionRate:     d.activities?.avgCompletionRate ?? d.completionRate   ?? 0,
        byStatus:           d.byStatus                   ?? {},
        budgetPlanned:      d.budget?.planned             ?? d.budgetPlanned      ?? 0,
        budgetCommitted:    d.budget?.committed           ?? d.budgetCommitted    ?? 0,
        budgetExecuted:     d.budget?.executed            ?? d.budgetExecuted     ?? 0,
        availableBalance:   d.budget?.availableBalance    ?? d.availableBalance   ?? 0,
        remainingToPay:     d.budget?.remainingToPay      ?? d.remainingToPay     ?? 0,
        commitmentRate:     d.budget?.commitmentRate      ?? d.commitmentRate     ?? 0,
        executionRate:      d.budget?.executionRate       ?? d.executionRate      ?? 0,
        upcomingDeadlines:  d.upcomingDeadlines           ?? [],
        recentAudit:        d.recentAuditLogs             ?? d.recentAudit        ?? [],
      };
    },
    refetchInterval: 60_000,
  });

  const { data: performance, isLoading: loadingPerf } = useQuery<{ byResponsible: PerfEntry[] }>({
    queryKey: ['dashboard-performance', filters.planId],
    queryFn: async () => { const r = await dashboardApi.getPerformance(); return r.data; },
  });

  const { data: allActivities = [], isLoading: loadingActivities } = useQuery<Activity[]>({
    queryKey: ['activities-dashboard', filters.planId, filters.status],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.planId) params.planId = filters.planId;
      if (filters.status) params.status = filters.status;
      const r = await activitiesApi.list({ ...params, limit: 1000 });
      return (r.data as any).data ?? [];
    },
  });

  const firstName = user?.firstName ?? '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const byStatus = (overview?.byStatus ?? {}) as Partial<Record<string, number>>;
  const s = (k: string) => byStatus[k] ?? 0;
  const inProgress = s('EN_COURS') + s('EN_PREPARATION');
  const overdue = s('EN_RETARD');
  const validated = s('VALIDEE');

  const recentActivities = [...allActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Tableau de bord"
        subtitle={`${greeting}, ${firstName} — ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        actions={<HelpButton page="dashboard" />}
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">

        {/* ── Filtres globaux ───────────────────────────── */}
        <FilterBar filters={filters} onChange={setFilters} plans={plans} />

        {/* ── KPI Row ─────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {loadingOverview ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                title="Total activités"
                value={overview?.totalActivities ?? 0}
                subtitle={`${inProgress} en cours`}
                icon={ActivityIcon}
                highlight
              />
              <KpiCard
                title="En retard"
                value={overdue}
                subtitle="Nécessitent attention"
                icon={AlertTriangle}
                accent="red"
              />
              <KpiCard
                title="Validées"
                value={validated}
                subtitle="Circuit complété"
                icon={CheckCircle2}
                accent="green"
              />
              <KpiCard
                title="En attente validation"
                value={overview?.pendingValidations ?? 0}
                subtitle="À traiter"
                icon={GitBranch}
                accent="amber"
              />
            </>
          )}
        </section>

        {/* ── Taux physique + budgétaire + validation ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Taux physique */}
          <div className="bg-[#0f1e38] rounded-2xl border border-[#1a2e52] p-5 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Exécution physique</p>
              <TrendingUp size={16} className="text-indigo-400" />
            </div>
            {loadingOverview ? <div className="h-24 bg-white/5 rounded-xl animate-pulse" /> : (
              <>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-bold tabular-nums leading-none">{overview?.completionRate ?? 0}</p>
                  <span className="text-2xl font-light text-white/50 mb-1">%</span>
                </div>
                <div className="w-full bg-white/[0.08] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all duration-700 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                    style={{ width: `${overview?.completionRate ?? 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/30">Taux moyen des check-lists d'activités</p>
              </>
            )}
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Exécution budgétaire</p>
              <Wallet size={16} className="text-blue-500" />
            </div>
            {loadingOverview ? <div className="h-24 bg-slate-100 rounded-xl animate-pulse" /> : (
              <BudgetChart
                planned={overview?.budgetPlanned ?? 0}
                committed={overview?.budgetCommitted ?? 0}
                executed={overview?.budgetExecuted ?? 0}
              />
            )}
          </div>

          {/* Circuit de validation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Circuit de validation</p>
              <Clock size={16} className="text-amber-500" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <ValidationPipeline counts={{
                SOUMISSION: s('EN_COURS'),
                VERIFICATION_HIERARCHIQUE: Math.floor(s('EN_COURS') / 3),
                VALIDATION_TECHNIQUE: Math.floor(s('EN_COURS') / 5),
              }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xl font-bold text-amber-700">{overview?.pendingValidations ?? 0}</p>
                <p className="text-xs text-amber-600 mt-0.5">En attente</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xl font-bold text-green-700">{validated}</p>
                <p className="text-xs text-green-600 mt-0.5">Clôturées</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Résultats vs cibles + Activités critiques ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Résultats atteints vs cibles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Résultats atteints vs cibles</p>
              <Target size={16} className="text-teal-500" />
            </div>
            {loadingActivities ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : (
              <ResultsVsTargets activities={allActivities} />
            )}
          </div>

          {/* Activités critiques */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Activités critiques</p>
              <Link href="/activities?status=EN_RETARD" className="text-xs text-[#2563eb] hover:underline font-medium">
                Voir tout →
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4">Priorité haute ou critique, non clôturées</p>
            {loadingActivities ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <CriticalActivities activities={allActivities} />
            )}
          </div>
        </section>

        {/* ── Risques + Performance par responsable ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Risques et blocages */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Risques et blocages</p>
              <Link href="/activities" className="text-xs text-[#2563eb] hover:underline font-medium">
                Voir tout →
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4">Activités en retard, bloquées ou suspendues</p>
            {loadingActivities ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <RisksAndBlockers activities={allActivities} />
            )}
          </div>

          {/* Performance par responsable */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Performance par responsable</p>
              <Users size={16} className="text-indigo-500" />
            </div>
            {loadingPerf ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : (
              <PerformanceByResponsable data={performance?.byResponsible ?? []} />
            )}
          </div>
        </section>

        {/* ── Répartition statuts + Échéances proches ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Répartition par statut</p>
            {loadingOverview ? (
              <div className="h-52 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <ActivityStatusChart byStatus={byStatus} />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Échéances proches</p>
              <CalendarClock size={16} className="text-slate-400" />
            </div>
            {loadingOverview ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : (
              <UpcomingDeadlines activities={overview?.upcomingDeadlines ?? []} />
            )}
          </div>
        </section>

        {/* ── Activités récentes + Journal d'audit ── */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Activités récentes</p>
              <Link href="/activities" className="text-xs text-[#2563eb] hover:underline font-medium">
                Voir tout →
              </Link>
            </div>
            {loadingActivities ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">Aucune activité</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-left border-b border-slate-100">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500">Activité</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Statut</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Priorité</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Avancement</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Responsable</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-right hidden md:table-cell">Échéance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map(act => (
                      <ActivityRow
                        key={act.id}
                        activity={act}
                        onClick={() => window.location.href = `/activities/${act.id}`}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Journal d'activité</p>
              <Link href="/notifications" className="text-xs text-[#2563eb] hover:underline font-medium">
                Voir tout →
              </Link>
            </div>
            {loadingOverview ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-4/5" />
                      <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AuditFeed entries={(overview?.recentAudit ?? []).slice(0, 8)} />
            )}
          </div>
        </section>

        {/* ── Résumé financier ────────────────────────── */}
        {!loadingOverview && overview && (
          <section className="bg-[#0b1629] rounded-2xl border border-[#1a2e52] overflow-hidden text-white">
            <div className="flex items-center justify-between px-5 md:px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Résumé financier</p>
              <Link href="/budgets" className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors font-medium">
                Voir le détail <BarChart3 size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              <div className="px-4 md:px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Prévu</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums">{formatCurrency(overview.budgetPlanned)}</p>
              </div>
              <div className="px-4 md:px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Engagé</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums text-blue-400">{formatCurrency(overview.budgetCommitted)}</p>
                <p className="text-[10px] text-white/20 mt-1">{overview.commitmentRate}%</p>
              </div>
              <div className="px-4 md:px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Disponible</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums text-indigo-400">{formatCurrency(overview.availableBalance)}</p>
                <p className="text-[10px] text-white/20 mt-1">Prévu - Engagé</p>
              </div>
              <div className="px-4 md:px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Exécuté</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums text-emerald-400">{formatCurrency(overview.budgetExecuted)}</p>
                <p className="text-[10px] text-white/20 mt-1">{overview.executionRate}%</p>
              </div>
              <div className="px-4 md:px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Reste à payer</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums text-orange-400">{formatCurrency(overview.remainingToPay)}</p>
                <p className="text-[10px] text-white/20 mt-1">Engagé - Exécuté</p>
              </div>
              <div className="px-4 md:px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Taux exéc.</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums text-amber-300">{overview.executionRate}%</p>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
