'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  planned: number;
  executed: number;
  committed?: number;
}

export function BudgetChart({ planned, executed, committed = 0 }: Props) {
  const data = [
    { name: 'Prévu', value: planned, color: '#cbd5e1' },
    { name: 'Engagé', value: committed, color: '#93c5fd' },
    { name: 'Exécuté', value: executed, color: '#2563eb' },
  ];

  const rate = planned > 0 ? Math.round((executed / planned) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Taux d'exécution</p>
          <p className="text-3xl font-bold text-slate-900">{rate}%</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>{formatCurrency(executed)}</p>
          <p className="text-slate-400">/ {formatCurrency(planned)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barSize={32} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis hide />
          <Tooltip
            formatter={(v) => formatCurrency(Number(v))}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
