'use client';

import { useQuery } from '@tanstack/react-query';
import { budgetsApi, plansApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { BudgetChart } from '@/components/dashboard/budget-chart';
import { formatCurrency, cn } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ActionPlan } from '@/lib/types';
import { useState } from 'react';

interface BudgetSummary {
  totalPlanned: number;
  totalCommitted: number;
  totalDisbursed: number;
  totalExecuted: number;
  executionRate: number;
  byActivity: {
    activityId: string;
    title: string;
    planned: number;
    executed: number;
    rate: number;
    fundingSource?: string;
  }[];
}

export default function BudgetsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const { data: plans = [] } = useQuery<ActionPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => { const r = await plansApi.list(); return r.data; },
  });

  const { data: summary, isLoading } = useQuery<BudgetSummary>({
    queryKey: ['budget-summary', selectedPlan],
    queryFn: async () => {
      const params = selectedPlan ? { planId: selectedPlan } : {};
      const r = await budgetsApi.summary(params);
      return r.data;
    },
  });

  const rate = summary?.executionRate ?? 0;
  const trend = rate >= 70 ? 'up' : rate >= 40 ? 'neutral' : 'down';

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Suivi budgétaire" subtitle="Vue consolidée des budgets par plan et activité" />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">

        {/* Plan filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedPlan}
            onChange={e => setSelectedPlan(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
          >
            <option value="">Tous les plans</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : !summary ? (
          <EmptyState icon={Wallet} title="Aucune donnée budgétaire" description="Aucune ligne budgétaire enregistrée." />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0f1e38] text-white rounded-2xl p-5">
                <p className="text-xs text-white/60 mb-1">Budget prévu</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalPlanned)}</p>
                <p className="text-xs text-white/40 mt-1">Enveloppe globale</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500 mb-1">Budget engagé</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalCommitted)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {summary.totalPlanned > 0 ? Math.round((summary.totalCommitted / summary.totalPlanned) * 100) : 0}% du prévu
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500 mb-1">Budget exécuté</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalExecuted)}</p>
                <p className="text-xs text-slate-400 mt-1">Dépenses effectives</p>
              </div>
              <div className={cn('rounded-2xl p-5 border', trend === 'up' ? 'bg-green-50 border-green-200' : trend === 'down' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Taux d'exécution</p>
                    <p className={cn('text-2xl font-bold', trend === 'up' ? 'text-green-700' : trend === 'down' ? 'text-red-700' : 'text-amber-700')}>
                      {rate}%
                    </p>
                  </div>
                  {trend === 'up' ? <TrendingUp size={20} className="text-green-500" /> :
                   trend === 'down' ? <TrendingDown size={20} className="text-red-500" /> :
                   <Minus size={20} className="text-amber-500" />}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
              <p className="text-sm font-semibold text-slate-700 mb-4">Répartition budgétaire</p>
              <BudgetChart
                planned={summary.totalPlanned}
                committed={summary.totalCommitted}
                executed={summary.totalExecuted}
              />
            </div>

            {/* Activity breakdown */}
            {summary.byActivity?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-700">Détail par activité</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Activité</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Source</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Prévu</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Exécuté</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Taux</th>
                        <th className="px-4 py-3 hidden md:table-cell w-28" />
                      </tr>
                    </thead>
                    <tbody>
                      {summary.byActivity.map(row => (
                        <tr key={row.activityId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 truncate max-w-xs">{row.title}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 text-right hidden sm:table-cell">{row.fundingSource ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">{formatCurrency(row.planned)}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">{formatCurrency(row.executed)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn('text-xs font-bold', row.rate >= 80 ? 'text-green-600' : row.rate >= 50 ? 'text-amber-600' : 'text-red-600')}>
                              {row.rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', row.rate >= 80 ? 'bg-green-500' : row.rate >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                                style={{ width: `${Math.min(100, row.rate)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
