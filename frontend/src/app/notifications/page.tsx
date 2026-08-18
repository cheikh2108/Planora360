'use client';

import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { ACTION_CONFIG, DEFAULT_CONFIG, humanAction } from '@/lib/action-config';

/* ─── Skeleton de timeline ───────────────────────────────────── */

function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map(g => (
        <div key={g}>
          <div className="h-3 w-32 bg-slate-200 rounded-full mb-5 animate-pulse" />
          <div className="space-y-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0 w-7">
                  <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse" />
                  {i < 2 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[28px]" />}
                </div>
                <div className={cn('flex-1 pt-1 space-y-2', i < 2 && 'pb-6')}>
                  <div className="h-3.5 w-48 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

export default function NotificationsPage() {
  const { data: entries = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ['audit-notifications'],
    queryFn: async () => {
      const r = await auditApi.list({ limit: 50 });
      return r.data;
    },
    refetchInterval: 30_000,
  });

  /* Group by calendar day */
  const grouped = entries.reduce<Record<string, AuditEntry[]>>((acc, e) => {
    const day = new Date(e.createdAt).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
      <Header title="Notifications" subtitle="Journal des événements de votre organisation" />

      <main className="flex-1 px-4 md:px-8 py-8 max-w-2xl">
        {isLoading ? (
          <TimelineSkeleton />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Les événements de votre organisation apparaîtront ici."
          />
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([day, dayEntries]) => (
              <section key={day}>
                {/* Day label */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5 capitalize">
                  {day}
                </p>

                {/* Timeline */}
                <div className="space-y-0">
                  {dayEntries.map((entry, idx) => {
                    const config = ACTION_CONFIG[entry.action] ?? DEFAULT_CONFIG;
                    const Icon   = config.icon;
                    const actor  = entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Système';
                    const meta   = entry.metadata as Record<string, string> | null;
                    const target = meta?.title ?? meta?.name ?? null;
                    const time   = new Date(entry.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit', minute: '2-digit',
                    });
                    const isLast = idx === dayEntries.length - 1;

                    return (
                      <div key={entry.id} className="flex items-start gap-4">

                        {/* Left: dot + connecting line */}
                        <div className="flex flex-col items-center shrink-0 w-7">
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center shrink-0 ring-2 ring-slate-50 z-10',
                            config.badge.replace('/15', '/20')
                          )}>
                            <Icon size={13} strokeWidth={2.2} />
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[28px]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={cn('flex-1 min-w-0 pt-1', !isLast && 'pb-6')}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 leading-snug">
                                {humanAction(entry.action)}
                                {target && (
                                  <span className="font-normal text-slate-500"> · {target}</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">{actor}</p>
                            </div>
                            <span className="text-[11px] text-slate-400 tabular-nums shrink-0 mt-0.5">
                              {time}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
