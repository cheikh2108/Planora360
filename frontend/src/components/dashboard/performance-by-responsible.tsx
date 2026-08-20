/**
 * Performance by Responsible Component
 */

import { ProgressBar } from '@/components/ui/progress-bar';

interface PerfEntry {
  userId: string;
  name: string;
  total: number;
  completed: number;
  overdue: number;
  avgCompletionRate: number;
}

interface PerformanceByResponsibleProps {
  data: PerfEntry[];
}

const MAX_DISPLAYED_ENTRIES = 6;

export function PerformanceByResponsible({ data }: PerformanceByResponsibleProps) {
  const safeData = Array.isArray(data) ? data : [];

  if (!safeData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
        Aucune donnée de performance
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {safeData.slice(0, MAX_DISPLAYED_ENTRIES).map((entry) => (
        <PerformanceEntry key={entry.userId} entry={entry} />
      ))}
    </div>
  );
}

function PerformanceEntry({ entry }: { entry: PerfEntry }) {
  const initials = entry.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-[#0f1e38]/10 flex items-center justify-center text-xs font-bold text-[#0f1e38] shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-slate-900 truncate">{entry.name}</p>
          <span className="text-xs font-bold text-slate-700 ml-2 shrink-0">
            {entry.avgCompletionRate}%
          </span>
        </div>
        <ProgressBar value={entry.avgCompletionRate} size="sm" />
      </div>

      <div className="flex items-center gap-2 shrink-0 text-xs">
        <span className="text-slate-500">
          {entry.completed}/{entry.total}
        </span>
        {entry.overdue > 0 && (
          <span className="text-red-500 font-semibold">
            {entry.overdue} retard{entry.overdue > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
