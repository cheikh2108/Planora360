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
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

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

/* ─── tiny helpers ─────────────────────────────────────────── */

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function rateColor(rate: number) {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 50) return 'text-amber-600';
  return 'text-red-600';
}
function rateBarColor(rate: number) {
  if (rate >= 80) return '#22c55e';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
}

/* ─── custom tooltip for bar chart ────────────────────────── */
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md px-3 py-2.5 text-xs space-y-1 max-w-56">
      <p className="font-semibold text-slate-800 line-clamp-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill ?? p.color }} />
          <span className="text-slate-500">{p.name}</span>
          <span className="font-bold text-slate-700 ml-auto">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

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

  const rate  = summary?.executionRate ?? 0;
  const trend = rate >= 70 ? 'up' : rate >= 40 ? 'neutral' : 'down';

  // Bar chart data: top 10 activities by planned budget
  const barData = (summary?.byActivity ?? [])
    .slice()
    .sort((a, b) => b.planned - a.planned)
    .slice(0, 10)
    .map(row => ({
      name: row.title.length > 22 ? row.title.slice(0, 20) + '…' : row.title,
      fullName: row.title,
      Prévu: row.planned,
      Exécuté: row.executed,
      rate: row.rate,
    }));

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Suivi budgétaire" subtitle="Vue consolidée des budgets par plan et activité" />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* Plan filter */}
        <div className="flex items-center gap-3">
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
              {/* Budget prévu — dark card */}
              <div className="bg-[#0f1e38] text-white rounded-2xl p-5 flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Budget prévu</p>
                <p className="text-4xl font-bold tabular-nums leading-none mt-1">{fmt(summary.totalPlanned)}</p>
                <p className="text-xs text-white/40 mt-1">Enveloppe globale</p>
              </div>

              {/* Budget engagé */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Budget engagé</p>
                <p className="text-4xl font-bold tabular-nums text-blue-600 leading-none mt-1">{fmt(summary.totalCommitted)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {summary.totalPlanned > 0
                    ? `${Math.round((summary.totalCommitted / summary.totalPlanned) * 100)}% du prévu`
                    : '—'}
                </p>
              </div>

              {/* Budget exécuté */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Budget exécuté</p>
                <p className="text-4xl font-bold tabular-nums text-green-600 leading-none mt-1">{fmt(summary.totalExecuted)}</p>
                <p className="text-xs text-slate-400 mt-1">Dépenses effectives</p>
              </div>

              {/* Taux d'exécution */}
              <div className={cn(
                'rounded-2xl border p-5 flex flex-col gap-1',
                trend === 'up'      ? 'bg-green-50 border-green-200' :
                trend === 'down'    ? 'bg-red-50 border-red-200'     :
                                      'bg-amber-50 border-amber-200'
              )}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Taux d'exécution</p>
                  {trend === 'up'
                    ? <TrendingUp size={16} className="text-green-500" />
                    : trend === 'down'
                    ? <TrendingDown size={16} className="text-red-500" />
                    : <Minus size={16} className="text-amber-500" />}
                </div>
                <p className={cn(
                  'text-4xl font-bold tabular-nums leading-none mt-1',
                  trend === 'up' ? 'text-green-700' : trend === 'down' ? 'text-red-700' : 'text-amber-700'
                )}>
                  {rate}%
                </p>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Donut / gauge — existing BudgetChart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Répartition globale</p>
                <BudgetChart
                  planned={summary.totalPlanned}
                  committed={summary.totalCommitted}
                  executed={summary.totalExecuted}
                />
              </div>

              {/* Horizontal bar chart — top activités */}
              {barData.length > 0 && (
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                    Exécution par activité (top {barData.length})
                  </p>
                  <ResponsiveContainer width="100%" height={barData.length * 36 + 24}>
                    <BarChart
                      layout="vertical"
                      data={barData}
                      margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                      barCategoryGap="30%"
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="Prévu" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={10}>
                      </Bar>
                      <Bar dataKey="Exécuté" radius={[0, 4, 4, 0]} barSize={10}>
                        {barData.map((d, i) => (
                          <Cell key={i} fill={rateBarColor(d.rate)} />
                        ))}
                        <LabelList
                          dataKey="rate"
                          position="right"
                          formatter={(v) => `${v}%`}
                          style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Activity breakdown table */}
            {summary.byActivity?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Détail par activité</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Activité</th>
                        <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">Source</th>
                        <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Prévu</th>
                        <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Exécuté</th>
                        <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Taux</th>
                        <th className="px-4 py-3 hidden md:table-cell w-28" />
                      </tr>
                    </thead>
                    <tbody>
                      {summary.byActivity.map(row => (
                        <tr key={row.activityId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 truncate max-w-xs">{row.title}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 text-right hidden sm:table-cell">
                            {row.fundingSource
                              ? <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{row.fundingSource}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700 tabular-nums">{formatCurrency(row.planned)}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold tabular-nums">{formatCurrency(row.executed)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn('text-xs font-bold tabular-nums', rateColor(row.rate))}>
                              {row.rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, row.rate)}%`, background: rateBarColor(row.rate) }}
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
