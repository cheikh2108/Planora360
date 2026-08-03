import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  highlight?: boolean;
  accent?: 'red' | 'amber' | 'green' | 'blue' | 'indigo';
}

const ACCENT_STYLES = {
  red:    { card: 'bg-red-50 border-red-100',    icon: 'bg-red-100',    iconColor: 'text-red-500',    value: 'text-red-700',    sub: 'text-red-400' },
  amber:  { card: 'bg-amber-50 border-amber-100', icon: 'bg-amber-100', iconColor: 'text-amber-500',  value: 'text-amber-700',  sub: 'text-amber-400' },
  green:  { card: 'bg-green-50 border-green-100', icon: 'bg-green-100', iconColor: 'text-green-600',  value: 'text-green-700',  sub: 'text-green-500' },
  blue:   { card: 'bg-blue-50 border-blue-100',   icon: 'bg-blue-100',  iconColor: 'text-blue-600',   value: 'text-blue-700',   sub: 'text-blue-400' },
  indigo: { card: 'bg-indigo-50 border-indigo-100', icon: 'bg-indigo-100', iconColor: 'text-indigo-600', value: 'text-indigo-700', sub: 'text-indigo-400' },
};

export function KpiCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend, highlight, accent }: KpiCardProps) {
  if (highlight) {
    return (
      <div className="rounded-2xl p-3 md:p-5 bg-[#0f1e38] border border-[#1a2e52] text-white flex flex-col gap-2 md:gap-3 transition-shadow hover:shadow-lg hover:shadow-[#0f1e38]/20">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5 leading-tight">{title}</p>
            <p className="text-3xl md:text-4xl font-bold leading-none tabular-nums text-white">{value}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/[0.08] flex items-center justify-center shrink-0">
            <Icon size={16} className="text-white/70" />
          </div>
        </div>
        {subtitle && <p className="text-[11px] md:text-xs text-white/40">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-white/[0.06]">
            <span className={cn('text-xs font-semibold', trend.value >= 0 ? 'text-green-400' : 'text-red-400')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-white/30">{trend.label}</span>
          </div>
        )}
      </div>
    );
  }

  const a = accent ? ACCENT_STYLES[accent] : null;

  return (
    <div className={cn(
      'rounded-2xl p-3 md:p-5 border flex flex-col gap-2 md:gap-3 transition-shadow hover:shadow-md',
      a ? `${a.card}` : 'bg-white border-slate-200'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5 leading-tight">{title}</p>
          <p className={cn('text-3xl md:text-4xl font-bold leading-none tabular-nums', a ? a.value : 'text-slate-900')}>{value}</p>
        </div>
        <div className={cn(
          'w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0',
          a ? a.icon : (iconBg ?? 'bg-slate-100')
        )}>
          <Icon size={16} className={a ? a.iconColor : (iconColor ?? 'text-slate-500')} />
        </div>
      </div>
      {subtitle && <p className={cn('text-[11px] md:text-xs', a ? a.sub : 'text-slate-400')}>{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-100">
          <span className={cn('text-xs font-semibold', trend.value >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
