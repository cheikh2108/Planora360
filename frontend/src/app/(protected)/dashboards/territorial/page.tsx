'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, TrendingUp, Activity as ActivityIcon, DollarSign } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { zonesApi } from '@/lib/api';
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
  const displayedZones = stats?.filter((z) => z.level <= 1) || [];

  if (isLoading) {
    return (
      <div>
        <Header
          title="Dashboard Territorial"
          subtitle="Vue d'ensemble des activités par zone géographique"
        />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div>
        <Header
          title="Dashboard Territorial"
          subtitle="Vue d'ensemble des activités par zone géographique"
        />
        <div className="p-8">
          <EmptyState
            icon={<MapPin size={64} className="text-gray-300" />}
            title="Aucune zone configurée"
            description="Créez des zones géographiques dans Administration > Zones"
          />
          <div className="flex justify-center mt-6">
            <Link
              href="/admin/zones"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Configurer les zones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard Territorial"
        subtitle="Vue d'ensemble des activités par zone géographique"
      />

      <div className="p-8 space-y-6">
        {/* KPIs Globaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ActivityIcon size={20} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Activités</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalActivities}</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalCompleted} terminées ({globalCompletionRate}%)
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Taux Complétion</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{globalCompletionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">Sur toutes les zones</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <DollarSign size={20} className="text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Budget Planifié</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {(totalBudgetPlanned / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-xs text-slate-500 mt-1">FCFA</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <DollarSign size={20} className="text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Exécution Budget</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{globalExecutionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">
              {(totalBudgetExecuted / 1_000_000).toFixed(1)}M FCFA exécutés
            </p>
          </div>
        </div>

        {/* Tableau par zone */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Statistiques par zone</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Zone
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Activités
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Terminées
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Taux Complétion
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Budget Planifié
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Budget Exécuté
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Exécution
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedZones.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-500">Aucune activité assignée à des zones</p>
                    </td>
                  </tr>
                ) : (
                  displayedZones.map((zone) => {
                    const completionColor =
                      zone.completionRate >= 80
                        ? 'text-green-600 bg-green-50'
                        : zone.completionRate >= 50
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-orange-600 bg-orange-50';

                    const executionColor =
                      zone.executionRate >= 80
                        ? 'text-green-600 bg-green-50'
                        : zone.executionRate >= 50
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-red-600 bg-red-50';

                    return (
                      <tr key={zone.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-blue-500 shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900">{zone.name}</p>
                              {zone.code && (
                                <p className="text-xs text-slate-500">{zone.code}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-slate-900">{zone.totalActivities}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-slate-700">{zone.completedActivities}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${completionColor}`}
                          >
                            {zone.completionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-slate-900">
                            {(zone.budgetPlanned / 1_000_000).toFixed(2)}M
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-slate-700">
                            {(zone.budgetExecuted / 1_000_000).toFixed(2)}M
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${executionColor}`}
                          >
                            {zone.executionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/activities?zoneId=${zone.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
      </div>
    </div>
  );
}
