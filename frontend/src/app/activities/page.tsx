'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api';
import type { Activity, ActivityStatus } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, cn } from '@/lib/utils';
import { CheckSquare, Search, Filter, Calendar, ChevronRight, User } from 'lucide-react';
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

export default function ActivitiesPage() {
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['activities', statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const r = await activitiesApi.list(params);
      return r.data;
    },
  });

  const filtered = search.trim()
    ? activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : activities;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Activités" subtitle={`${filtered.length} activité${filtered.length > 1 ? 's' : ''}`} />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-4">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une activité..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Activité</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Priorité</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell w-36">Avancement</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Responsable</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Échéance</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(act => (
                    <tr key={act.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3.5">
                        <Link href={`/activities/${act.id}`} className="block">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-[#2563eb] truncate max-w-xs transition-colors">
                            {act.title}
                          </p>
                          {act.axis && (
                            <p className="text-xs text-slate-400 truncate max-w-xs">
                              {act.axis.actionPlan?.title} › {act.axis.title}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <StatusBadge status={act.status} dot />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className={cn('text-xs font-semibold', PRIORITY_COLORS[act.priority])}>
                          {PRIORITY_LABELS[act.priority]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell w-36">
                        <ProgressBar value={act.completionRate} showLabel size="sm" />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {act.responsible && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                              {act.responsible.firstName[0]}{act.responsible.lastName[0]}
                            </div>
                            <span className="text-xs text-slate-600 truncate max-w-[100px]">
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
        </div>
      </main>
    </div>
  );
}
