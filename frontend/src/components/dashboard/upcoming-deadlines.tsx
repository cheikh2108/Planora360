import type { Activity } from '@/lib/types';
import { cn, formatDateRelative, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { AlertTriangle } from 'lucide-react';

interface Props {
  activities: Activity[];
}

export function UpcomingDeadlines({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
        <AlertTriangle size={24} className="opacity-50" />
        <p className="text-sm">Aucune échéance proche</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {activities.map((act) => {
        const daysLabel = act.dueDate ? formatDateRelative(act.dueDate) : null;
        const isOverdue = act.status === 'EN_RETARD';

        return (
          <li key={act.id} className="py-3 flex items-center gap-3">
            <div className={cn(
              'w-1.5 h-10 rounded-full shrink-0',
              isOverdue ? 'bg-red-500' :
              act.priority === 'CRITIQUE' ? 'bg-orange-500' :
              act.priority === 'HAUTE' ? 'bg-amber-400' : 'bg-blue-400'
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{act.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', STATUS_COLORS[act.status])}>
                  {STATUS_LABELS[act.status]}
                </span>
                <ProgressBar value={act.completionRate} className="w-20" />
                <span className="text-xs text-slate-400">{act.completionRate}%</span>
              </div>
            </div>
            {daysLabel && (
              <span className={cn(
                'text-xs font-semibold shrink-0 px-2 py-1 rounded-lg',
                isOverdue ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'
              )}>
                {daysLabel}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
