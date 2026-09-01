import { cn, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS, formatDate, formatDateRelative } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { Activity } from '@/lib/types';
import { AlertCircle, Calendar } from 'lucide-react';

interface Props {
  activity: Activity;
  onClick?: () => void;
}

export function ActivityRow({ activity, onClick }: Props) {
  const isOverdue = activity.status === 'EN_RETARD';
  const isUrgent = activity.priority === 'CRITIQUE' || activity.priority === 'HAUTE';

  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-slate-100 last:border-0 transition-colors',
        onClick && 'cursor-pointer hover:bg-slate-50'
      )}
    >
      <td className="py-3 px-4">
        <div className="flex items-start gap-2.5">
          {isOverdue && <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate max-w-xs">{activity.title}</p>
            {activity.axis && (
              <p className="text-xs text-slate-600 truncate">
                {activity.axis.actionPlan?.title} › {activity.axis.title}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[activity.status])}>
          {STATUS_LABELS[activity.status]}
        </span>
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        <span className={cn('text-xs font-semibold', PRIORITY_COLORS[activity.priority])}>
          {PRIORITY_LABELS[activity.priority]}
        </span>
      </td>
      <td className="py-3 px-4 w-36 hidden sm:table-cell">
        <ProgressBar value={activity.completionRate} showLabel size="sm" />
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        {activity.responsible && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
              {activity.responsible.firstName[0]}{activity.responsible.lastName[0]}
            </div>
            <span className="text-xs text-slate-600 truncate max-w-[100px]">
              {activity.responsible.firstName} {activity.responsible.lastName}
            </span>
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-right hidden md:table-cell">
        {activity.dueDate ? (
          <div className={cn('flex items-center justify-end gap-1 text-xs', isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500')}>
            <Calendar size={12} />
            <span className="hidden xl:inline">{formatDate(activity.dueDate)}</span>
            <span className="xl:hidden">{formatDateRelative(activity.dueDate)}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
}
