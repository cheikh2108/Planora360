'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, TrendingUp, Activity as ActivityIcon, DollarSign, TrendingDown, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { zonesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ZoneStat {
  id: string;
  name: string;
  code?: string;
  level: number;
  totalActivities: number;
  completedActivities: number;
  completionRate: number;
  budgetPlanned: number;
  budgetExecuted: number;
  executionRate: number;
}

export default function TerritorialDashboardPage() {
  const { data: stats, isLoading } = useQuery<ZoneStat[]>({
    queryKey: ['zones', 'stats'],
    queryFn: async () => {
      const response = await zonesApi.getStats();
      return response.data;
    },
  });

  const totalActivities = stats?.reduce((sum, z) => sum + z.totalActivities, 0) || 0;
  const totalCompleted = stats?.reduce((sum, z) => sum + z.completedActivities, 0) || 0;
  const totalBudgetPlanned = stats?.reduce((sum, z) => sum + z.budgetPlanned, 0) || 0;
  const totalBudgetExecuted = stats?.reduce((sum, z) => sum + z.budgetExecuted, 0) || 0;

  const globalCompletionRate =
    totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;
  const globalExecutionRate =
    totalBudgetPlanned > 0 ? Math.round((totalBudgetExecuted / totalBudgetPlanned) * 100) : 0;

  // Zones niveau 0 et 1 seulement (pays + régions)
  // Protection: s'assurer que stats est bien un tableau avant filter
  const displayedZones = Array.isArray(stats) ? stats.filter((z) => z.level <= 1) : [];

  const kpiCards = [
    {
      label: 'Total Activités',
      value: totalActivities,
      sublabel: `${totalCompleted} terminées`,
      icon: ActivityIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Taux Complétion',
      value: `${globalCompletionRate}%`,
      sublabel: 'Sur toutes les zones',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Budget Planifié',
      value: `${(totalBudgetPlanned / 1_000_000).toFixed(1)}M`,
      sublabel: 'FCFA',
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+15%',
      trendUp: true,
    },
    {
      label: 'Exécution Budget',
      value: `${globalExecutionRate}%`,
      sublabel: `${(totalBudgetExecuted / 1_000_000).toFixed(1)}M FCFA exécutés`,
      icon: DollarSign,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      trend: '+10%',
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Dashboard Territorial"
          subtitle="Vue d'ensemble des activités par zone géographique"
        />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Dashboard Territorial"
          subtitle="Vue d'ensemble des activités par zone géographique"
        />
        <main className="flex-1 px-4 md:px-6 py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune zone configurée</h3>
            <p className="text-sm text-slate-600 mb-6">
              Créez des zones géographiques dans Administration &gt; Zones
            </p>
            <Link
              href="/admin/zones"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Configurer les zones
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Dashboard Territorial"
        subtitle="Vue d'ensemble des activités par zone géographique"
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className={cn('rounded-2xl border border-slate-200 p-5 bg-white')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      {kpi.label}
                    </p>
                    <p className={cn('text-3xl font-bold tabular-nums mt-2', kpi.color)}>
                      {kpi.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{kpi.sublabel}</p>
                  </div>
                  <div className={cn('rounded-xl p-3', kpi.bg)}>
                    <Icon size={20} className={kpi.color} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {kpi.trendUp ? (
                    <TrendingUp size={14} className="text-green-600" />
                  ) : (
                    <TrendingDown size={14} className="text-red-600" />
                  )}
                  <span className={cn('text-xs font-medium', kpi.trendUp ? 'text-green-600' : 'text-red-600')}>
                    {kpi.trend}
                  </span>
                  <span className="text-xs text-slate-600">vs mois dernier</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistiques par zone */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-600" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Statistiques par Zone
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Zone
                  </th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Activités
                  </th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Terminées
                  </th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Complétion
                  </th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Budget Planifié
                  </th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Budget Exécuté
                  </th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Exécution
                  </th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedZones.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <p className="text-sm text-slate-600">Aucune activité assignée à des zones</p>
                    </td>
                  </tr>
                ) : (
                  displayedZones.map((zone) => {
                    const completionColor =
                      zone.completionRate >= 80
                        ? 'bg-green-50 text-green-700'
                        : zone.completionRate >= 50
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-orange-50 text-orange-700';

                    const executionColor =
                      zone.executionRate >= 80
                        ? 'bg-green-50 text-green-700'
                        : zone.executionRate >= 50
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-red-50 text-red-700';

                    return (
                      <tr key={zone.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{zone.name}</p>
                              {zone.code && (
                                <p className="text-xs text-slate-500 truncate mt-0.5">{zone.code}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-semibold text-slate-900 tabular-nums">{zone.totalActivities}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm text-slate-700 tabular-nums">{zone.completedActivities}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide',
                              completionColor
                            )}
                          >
                            {zone.completionRate}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-slate-900 tabular-nums">
                            {(zone.budgetPlanned / 1_000_000).toFixed(2)}M
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm text-slate-700 tabular-nums">
                            {(zone.budgetExecuted / 1_000_000).toFixed(2)}M
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide',
                              executionColor
                            )}
                          >
                            {zone.executionRate}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Link
                            href={`/activities?zoneId=${zone.id}`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Voir activités →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
