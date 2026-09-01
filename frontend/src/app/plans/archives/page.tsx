'use client';

import { useQuery } from '@tanstack/react-query';
import { plansApi } from '@/lib/api';
import type { ActionPlan } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { Archive, FolderKanban, ChevronRight, Calendar, Target, Activity } from 'lucide-react';
import Link from 'next/link';

function ArchivedPlanCard({ plan }: { plan: ActionPlan }) {
  const total = plan.axes?.reduce((n, a) => n + (a.activities?.length ?? 0), 0) ?? 0;

  return (
    <Link href={`/plans/${plan.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all flex flex-col gap-4 opacity-80 hover:opacity-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-400 flex items-center justify-center shrink-0">
              <Archive size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-700 text-sm line-clamp-2 leading-snug">{plan.title}</h3>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-slate-100 text-slate-400">
            Archivé
          </span>
        </div>

        {plan.strategicGoals && (
          <p className="text-xs text-slate-400 line-clamp-2 -mt-1">{plan.strategicGoals}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={11} className="shrink-0" />
          <span>{formatDate(plan.periodStart)} – {formatDate(plan.periodEnd)}</span>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Target size={11} />
            <span><span className="font-semibold">{plan.axes?.length ?? 0}</span> axes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Activity size={11} />
            <span><span className="font-semibold">{total}</span> activités</span>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors ml-auto shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export default function ArchivesPage() {
  const { data: plans = [], isLoading } = useQuery<ActionPlan[]>({
    queryKey: ['plans-archives'],
    queryFn: async () => {
      const r = await plansApi.list({ limit: 1000 });
      return ((r.data as any).data as ActionPlan[] ?? []).filter(p => p.status === 'ARCHIVE');
    },
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Archives" subtitle={`${plans.length} plan${plans.length > 1 ? 's' : ''} archivé${plans.length > 1 ? 's' : ''}`} />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            illustration="inbox"
            title="Aucun plan archivé"
            description="Les plans que vous archivez apparaîtront ici."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map(plan => <ArchivedPlanCard key={plan.id} plan={plan} />)}
          </div>
        )}
      </main>
    </div>
  );
}
