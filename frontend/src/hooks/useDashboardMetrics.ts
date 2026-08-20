/**
 * Dashboard Metrics Hook
 * Calcule les métriques dérivées à partir des données brutes
 */

import type { DashboardOverview, Activity } from '@/lib/types';

export interface DashboardMetrics {
  byStatus: {
    inProgress: number;
    overdue: number;
    validated: number;
  };
  recentActivities: Activity[];
  greeting: string;
}

export function useDashboardMetrics(
  overview: DashboardOverview | undefined,
  activities: Activity[],
  firstName: string = '',
): DashboardMetrics {
  const byStatusMap = (overview?.byStatus ?? {}) as Partial<Record<string, number>>;
  const getStatusCount = (key: string) => byStatusMap[key] ?? 0;

  const inProgress = getStatusCount('EN_COURS') + getStatusCount('EN_PREPARATION');
  const overdue = getStatusCount('EN_RETARD');
  const validated = getStatusCount('VALIDEE');

  const safeActivities = Array.isArray(activities) ? activities : [];
  const recentActivities = [...safeActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const greeting = getTimeBasedGreeting();

  return {
    byStatus: { inProgress, overdue, validated },
    recentActivities,
    greeting,
  };
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}
