'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api';
import type { Activity, ActivityStatus } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, PRIORITY_LABELS, STATUS_LABELS, cn } from '@/lib/utils';
import { CheckSquare, Search, Filter, Calendar, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import Link from 'next/link';

const STATUS_FILTERS: { value: ActivityStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'NON_DEMARREE', label: 'Non démarrées' },
  { value: 'EN_PREPARATION', label: 'En préparation' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'EN_RETARD', label: 'En retard' },
  { value: 'TERMINEE', label: 'Terminées' },
  { value: 'VALIDEE', label: 'Validées' },
];

const STATUS_FILL: Partial<Record<ActivityStatus, string>> = {
  NON_DEMARREE: '#94a3b8',
  EN_PREPARATION: '#3b82f6',
  EN_COURS: '#6366f1',
  EN_RETARD: '#ef4444',
  TERMINEE: '#14b8a6',
  VALIDEE: '#22c55e',
  EN_ATTENTE: '#f59e0b',
  SUSPENDUE: '#f97316',
  ANNULEE: '#6b7280',
};

const PRIORITY_PILL: Record<string, string> = {
  BASSE: 'bg-slate-100 text-slate-500',
  NORMALE: 'bg-blue-50 text-blue-600',
  HAUTE: 'bg-amber-50 text-amber-600',
  CRITIQUE: 'bg-red-50 text-red-600',
};

function ActivitiesContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const { data: activitiesPage, isLoading } = useQuery({
    queryKey: ['activities', statusFilter, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const r = await activitiesApi.list(params);
      return r.data as { data: Activity[]; total: number; page: number; limit: number };
    },
  });
  const activities: Activity[] = activitiesPage?.data ?? [];
  const total = activitiesPage?.total ?? 0;

  // Separate full-list query for chart and KPIs — always unfiltered
  const { data: allActivities = [] } = useQuery<Activity[]>({
    queryKey: ['activities-overview'],
    queryFn: async () => { const r = await activitiesApi.list({ limit: 1000 }); return (r.data as any).data ?? []; },
    staleTime: 60_000,
  });

  const filtered = search.trim()
    ? activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : activities;
  const displayTotal = search.trim() ? filtered.length : total;

  const enCours = allActivities.filter(a => a.status === 'EN_COURS').length;
  const enRetard = allActivities.filter(a => a.status === 'EN_RETARD').length;
  const terminees = allActivities.filter(a => a.status === 'TERMINEE' || a.status === 'VALIDEE').length;

  const chartData = useMemo(() => {
    const counts: Partial<Record<ActivityStatus, number>> = {};
    for (const a of allActivities) {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, v]) => (v ?? 0) > 0)
      .map(([status, value]) => ({
        status: status as ActivityStatus,
        name: STATUS_LABELS[status as ActivityStatus] ?? status,
        value: value as number,
        fill: STATUS_FILL[status as ActivityStatus] ?? '#94a3b8',
      }));
  }, [allActivities]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Activités" subtitle={`${displayTotal} activité${displayTotal > 1 ? 's' : ''}`} />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* KPI strip + donut */}
        {!isLoading && allActivities.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
              {[
                { label: 'Total', value: allActivities.length, color: 'text-slate-900', bg: 'bg-white' },
                { label: 'En cours', value: enCours, color: 'text-indigo-600', bg: 'bg-white' },
                { label: 'En retard', value: enRetard, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Terminées', value: terminees, color: 'text-teal-600', bg: 'bg-white' },
              ].map(k => (
                <div key={k.label} className={cn('rounded-2xl border border-slate-200 p-3 md:p-4 flex flex-col gap-1', k.bg)}>
                  <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k.label}</p>
                  <p className={cn('text-2xl md:text-4xl font-bold tabular-nums', k.color)}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Donut chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Répartition</p>
              <div className="flex items-center gap-3">
                <PieChart width={80} height={80}>
                  <Pie
                    data={chartData}
                    cx={40}
                    cy={40}
                    innerRadius={26}
                    outerRadius={38}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v, n]}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}
                  />
                </PieChart>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  {chartData.slice(0, 6).map(d => (
                    <div key={d.status} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                      <span className="text-[10px] text-slate-500 truncate flex-1">{d.name}</span>
                      <span className="text-[10px] font-bold text-slate-700 tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une activité..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                  statusFilter === f.value
                    ? 'bg-[#0f1e38] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Liste des activités</p>
            {total > 0 && (
              <span className="text-xs tabular-nums text-slate-400">{total}</span>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Aucune activité"
              description={search ? 'Aucun résultat pour cette recherche.' : 'Créez des activités depuis un plan d\'action.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Activité</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">Statut</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Priorité</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell w-36">Avancement</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Responsable</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">Échéance</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(act => (
                    <tr key={act.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3.5">
                        <Link href={`/activities/${act.id}`} className="block">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-[#2563eb] truncate transition-colors">
                            {act.title}
                          </p>
                          {act.axis && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {act.axis.actionPlan?.title} › {act.axis.title}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <StatusBadge status={act.status} dot />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', PRIORITY_PILL[act.priority])}>
                          {PRIORITY_LABELS[act.priority]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell w-36">
                        <ProgressBar value={act.completionRate} showLabel size="sm" />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {act.responsible && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#0f1e38]/10 flex items-center justify-center text-[10px] font-bold text-[#0f1e38] shrink-0">
                              {act.responsible.firstName[0]}{act.responsible.lastName[0]}
                            </div>
                            <span className="text-xs text-slate-600 truncate max-w-25">
                              {act.responsible.firstName} {act.responsible.lastName}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        {act.dueDate ? (
                          <div className={cn('flex items-center justify-end gap-1 text-xs', act.status === 'EN_RETARD' ? 'text-red-600 font-semibold' : 'text-slate-500')}>
                            <Calendar size={11} />
                            {formatDate(act.dueDate)}
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-3">
                        <Link href={`/activities/${act.id}`}>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2563eb] transition-colors" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!search.trim() && total > 20 && (
            <div className="px-4 py-3 border-t border-slate-100">
              <Pagination page={page} total={total} limit={20} onChange={setPage} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense>
      <ActivitiesContent />
    </Suspense>
  );
}
