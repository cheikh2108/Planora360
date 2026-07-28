import { cn, STATUS_LABELS, STATUS_COLORS, STATUS_DOT } from '@/lib/utils';
import type { ActivityStatus } from '@/lib/types';

interface Props {
  status: ActivityStatus;
  dot?: boolean;
}

export function StatusBadge({ status, dot }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', STATUS_COLORS[status])}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[status])} />}
      {STATUS_LABELS[status]}
    </span>
  );
}
