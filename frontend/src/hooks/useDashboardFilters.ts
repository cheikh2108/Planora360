/**
 * Dashboard Filters Hook
 * Applique les filtres période et statut aux activités
 */

import type { Activity } from '@/lib/types';

export interface DashboardFilters {
  planId: string;
  period: 'all' | 'month' | 'quarter' | 'year';
  status: string;
}

export function useFilteredActivities(activities: Activity[], filters: DashboardFilters): Activity[] {
  let filtered = activities;

  // Filtre par période
  if (filters.period !== 'all') {
    const now = new Date();
    const startDate = getPeriodStartDate(now, filters.period);

    filtered = filtered.filter((activity) => {
      const activityDate = new Date(activity.createdAt);
      return activityDate >= startDate;
    });
  }

  return filtered;
}

function getPeriodStartDate(now: Date, period: 'month' | 'quarter' | 'year'): Date {
  const date = new Date(now);

  switch (period) {
    case 'month':
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;

    case 'quarter':
      const currentMonth = date.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      date.setMonth(quarterStartMonth);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;

    case 'year':
      date.setMonth(0);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;

    default:
      return new Date(0);
  }
}
