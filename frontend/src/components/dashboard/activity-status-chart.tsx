'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ActivityStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/utils';

const STATUS_CHART_COLORS: Partial<Record<ActivityStatus, string>> = {
  NON_DEMARREE: '#94a3b8',
  EN_PREPARATION: '#60a5fa',
  EN_COURS: '#6366f1',
  EN_ATTENTE: '#f59e0b',
  SUSPENDUE: '#f97316',
  TERMINEE: '#2dd4bf',
  VALIDEE: '#22c55e',
  EN_RETARD: '#ef4444',
  ANNULEE: '#9ca3af',
};

interface Props {
  byStatus: Partial<Record<ActivityStatus, number>>;
}

export function ActivityStatusChart({ byStatus }: Props) {
  const data = Object.entries(byStatus)
    .filter(([, v]) => v && v > 0)
    .map(([key, value]) => ({
      name: STATUS_LABELS[key as ActivityStatus] ?? key,
      value: value as number,
      color: STATUS_CHART_COLORS[key as ActivityStatus] ?? '#94a3b8',
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
        Aucune activité
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
