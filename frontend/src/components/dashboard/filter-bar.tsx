/**
 * Dashboard Filter Bar Component
 */

import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActionPlan } from '@/lib/types';

export interface DashboardFilters {
  planId: string;
  period: 'all' | 'month' | 'quarter' | 'year';
  status: string;
}

interface FilterBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  plans: ActionPlan[];
}

const PERIODS = [
  { value: 'all', label: 'Toute la période' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
] as const;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous statuts' },
  { value: 'EN_RETARD', label: 'En retard' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'EN_PREPARATION', label: 'En préparation' },
  { value: 'TERMINEE', label: 'Terminées' },
  { value: 'VALIDEE', label: 'Validées' },
];

export function FilterBar({ filters, onChange, plans }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={14} className="text-slate-600 shrink-0" />

      <select
        value={filters.planId}
        onChange={(e) => onChange({ ...filters, planId: e.target.value })}
        className="h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
      >
        <option value="">Tous les plans</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.title}
          </option>
        ))}
      </select>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-x-auto">
        {PERIODS.map((period) => (
          <button
            key={period.value}
            onClick={() => onChange({ ...filters, period: period.value })}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
              filters.period === period.value
                ? 'bg-[#0f1e38] text-white'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
