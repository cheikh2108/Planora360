import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  trackClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, className, trackClassName, showLabel, size = 'sm' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color =
    clamped >= 80 ? 'bg-green-500' :
    clamped >= 50 ? 'bg-blue-500' :
    clamped >= 25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-slate-200 overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5', trackClassName)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 w-8 text-right shrink-0">{clamped}%</span>
      )}
    </div>
  );
}
