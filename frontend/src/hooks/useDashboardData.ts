/**
 * Dashboard Data Hook
 * Centralise la logique de récupération des données du dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, activitiesApi, plansApi } from '@/lib/api';
import type { DashboardOverview, Activity, ActionPlan } from '@/lib/types';

export interface DashboardFilters {
  planId: string;
  period: 'all' | 'month' | 'quarter' | 'year';
  status: string;
}

export interface PerfEntry {
  userId: string;
  name: string;
  total: number;
  completed: number;
  overdue: number;
  avgCompletionRate: number;
}

const DASHBOARD_REFRESH_INTERVAL = 60_000;
const LARGE_LIMIT = 1000;

export function useDashboardData(filters: DashboardFilters) {
  const plans = usePlans();
  const overview = useOverview(filters.planId);
  const performance = usePerformance(filters.planId);
  const activities = useActivities(filters);

  return {
    plans: plans.data,
    overview: overview.data,
    performance: performance.data,
    activities: activities.data,
    isLoading: overview.isLoading || performance.isLoading || activities.isLoading,
  };
}

function usePlans() {
  return useQuery<ActionPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await plansApi.list({ limit: LARGE_LIMIT });
      const data = response.data as any;
      return data.data ?? [];
    },
  });
}

function useOverview(planId: string) {
  return useQuery<DashboardOverview>({
    queryKey: ['dashboard-overview', planId],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return normalizeOverviewData(response.data as any);
    },
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
  });
}

function usePerformance(planId: string) {
  return useQuery<{ byResponsible: PerfEntry[] }>({
    queryKey: ['dashboard-performance', planId],
    queryFn: async () => {
      const response = await dashboardApi.getPerformance();
      return response.data;
    },
  });
}

function useActivities(filters: DashboardFilters) {
  return useQuery<Activity[]>({
    queryKey: ['activities-dashboard', filters.planId, filters.status],
    queryFn: async () => {
      const params = buildActivityParams(filters);
      const response = await activitiesApi.list({ ...params, limit: LARGE_LIMIT });
      return extractActivitiesData(response.data);
    },
  });
}

function normalizeOverviewData(data: any): DashboardOverview {
  return {
    ...data,
    totalActivities: data.activities?.total ?? data.totalActivities ?? 0,
    pendingValidations: data.activities?.pendingValidations ?? data.pendingValidations ?? 0,
    overdueActivities: data.activities?.overdue ?? data.overdueActivities ?? 0,
    completionRate: data.activities?.avgCompletionRate ?? data.completionRate ?? 0,
    byStatus: data.byStatus ?? {},
    budgetPlanned: data.budget?.planned ?? data.budgetPlanned ?? 0,
    budgetCommitted: data.budget?.committed ?? data.budgetCommitted ?? 0,
    budgetExecuted: data.budget?.executed ?? data.budgetExecuted ?? 0,
    availableBalance: data.budget?.availableBalance ?? data.availableBalance ?? 0,
    remainingToPay: data.budget?.remainingToPay ?? data.remainingToPay ?? 0,
    commitmentRate: data.budget?.commitmentRate ?? data.commitmentRate ?? 0,
    executionRate: data.budget?.executionRate ?? data.executionRate ?? 0,
    upcomingDeadlines: data.upcomingDeadlines ?? [],
    recentAudit: data.recentAuditLogs ?? data.recentAudit ?? [],
  };
}

function buildActivityParams(filters: DashboardFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.planId) params.planId = filters.planId;
  if (filters.status) params.status = filters.status;
  return params;
}

function extractActivitiesData(data: any): Activity[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
}
