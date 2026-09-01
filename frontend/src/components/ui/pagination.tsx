'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, total, limit, onChange, className }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const btn = (
    content: React.ReactNode,
    target: number,
    disabled: boolean,
    active = false,
  ) => (
    <button
      key={String(content)}
      disabled={disabled}
      onClick={() => !disabled && onChange(target)}
      className={cn(
        'min-w-[2rem] h-8 px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center',
        active
          ? 'text-white'
          : disabled
          ? 'text-slate-300 cursor-not-allowed'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      )}
      style={active ? { backgroundColor: 'var(--color-brand)' } : undefined}
    >
      {content}
    </button>
  );

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={cn('flex items-center justify-between gap-4 px-1', className)}>
      <p className="text-xs text-slate-600 tabular-nums shrink-0">
        {from}–{to} sur {total}
      </p>
      <div className="flex items-center gap-0.5">
        {btn(<ChevronLeft size={14} />, page - 1, page === 1)}
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`ellipsis-${i}`} className="min-w-[2rem] h-8 flex items-center justify-center text-xs text-slate-600">…</span>
            : btn(p, p as number, false, p === page)
        )}
        {btn(<ChevronRight size={14} />, page + 1, page === totalPages)}
      </div>
    </div>
  );
}
