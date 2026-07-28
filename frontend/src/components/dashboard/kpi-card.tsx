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
}

export function KpiCard({ title, value, subtitle, icon: Icon, iconColor, iconBg, trend, highlight }: KpiCardProps) {
  return (
    <div className={cn(
      'rounded-2xl p-5 border flex flex-col gap-3 transition-shadow hover:shadow-md',
      highlight
        ? 'bg-[#0f1e38] border-transparent text-white'
        : 'bg-white border-slate-200 text-slate-900'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn('text-xs font-medium mb-1', highlight ? 'text-white/60' : 'text-slate-500')}>
            {title}
          </p>
          <p className={cn('text-3xl font-bold leading-none', highlight ? 'text-white' : 'text-slate-900')}>
            {value}
          </p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg ?? (highlight ? 'bg-white/10' : 'bg-slate-100'))}>
          <Icon size={20} className={iconColor ?? (highlight ? 'text-white' : 'text-slate-600')} />
        </div>
      </div>
      {subtitle && (
        <p className={cn('text-xs', highlight ? 'text-white/50' : 'text-slate-400')}>{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center gap-1.5 mt-auto pt-1 border-t border-current/10">
          <span className={cn('text-xs font-semibold', trend.value >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className={cn('text-xs', highlight ? 'text-white/40' : 'text-slate-400')}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
