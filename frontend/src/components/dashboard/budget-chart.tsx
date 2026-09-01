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
    { name: 'Engagé', value: committed, color: '#3b82f6' },
    { name: 'Exécuté', value: executed, color: '#10b981' },
  ];

  const available = Math.max(0, planned - committed);
  const remaining = Math.max(0, committed - executed);
  const commitmentRate = planned > 0 ? Math.round((committed / planned) * 100) : 0;
  const executionRate = planned > 0 ? Math.round((executed / planned) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Taux d'exécution</p>
          <p className="text-2xl font-bold text-slate-900">{executionRate}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Taux d'engagement</p>
          <p className="text-2xl font-bold text-blue-600">{commitmentRate}%</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} barSize={28} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
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

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <div>
          <p className="text-[9px] text-slate-600">Disponible</p>
          <p className="text-sm font-bold text-indigo-600">{formatCurrency(available)}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-600">Reste à payer</p>
          <p className="text-sm font-bold text-orange-600">{formatCurrency(remaining)}</p>
        </div>
      </div>
    </div>
  );
}
