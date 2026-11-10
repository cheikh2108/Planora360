'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import type { NotificationEntry, NotificationFeed } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Bell, Calendar, CheckCheck } from 'lucide-react';
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
                <div className="flex flex-col items-center shrink-0 w-9">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse" />
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
  const [page, setPage] = useState(1);
  const limit = 50;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationFeed>({
    queryKey: ['notifications', 'page', page],
    queryFn: async () => (await notificationsApi.list({ limit, page })).data,
    refetchInterval: 30_000,
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const unread = data?.unreadCount ?? 0;

  // Group by calendar day
  const grouped = entries.reduce<Record<string, NotificationEntry[]>>((acc, e) => {
    const day = new Date(e.createdAt).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-[#f8fafc]">
      <Header
        title="Notifications"
        subtitle="Ce que les autres membres de votre organisation ont fait récemment"
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
        {/* Stats + Filters card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0f1e38]/5 flex items-center justify-center shrink-0">
                <Bell size={20} className="text-[#0f1e38]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {unread > 0 ? `${unread.toLocaleString('fr-FR')} non lue${unread > 1 ? 's' : ''}` : 'Tout est lu'}
                </h2>
                <p className="text-xs text-slate-500">{total.toLocaleString('fr-FR')} notification{total > 1 ? 's' : ''} au total</p>
              </div>
            </div>

            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
              >
                <CheckCheck size={16} />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(ACTION_CONFIG)
              .slice(0, 8)
              .map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', config.dot.replace('bg-', 'bg-'))} />
                  <span className="text-xs text-slate-500">{config.label}</span>
                </div>
              ))}
            {Object.keys(ACTION_CONFIG).length > 8 && (
              <span className="text-xs text-slate-600">
                +{Object.keys(ACTION_CONFIG).length - 8} types
              </span>
            )}
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <TimelineSkeleton />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            illustration="inbox"
            title="Aucune notification"
            description="Les actions des autres membres de votre organisation apparaîtront ici."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-10">
            {Object.entries(grouped).map(([day, dayEntries]) => (
              <section key={day}>
                {/* Day label */}
                <div className="flex items-center gap-3 mb-6">
                  <Calendar size={14} className="text-slate-600" />
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 capitalize">
                    {day}
                  </p>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {dayEntries.map((entry, idx) => {
                    const config = ACTION_CONFIG[entry.action] ?? DEFAULT_CONFIG;
                    const Icon = config.icon;
                    const actor = entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Système';
                    const meta = entry.metadata as Record<string, string> | null;
                    const target = meta?.title ?? meta?.name ?? null;
                    const time = new Date(entry.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const isLast = idx === dayEntries.length - 1;

                    return (
                      <div key={entry.id} className="flex items-start gap-4 group">
                        {/* Left: icon + connecting line */}
                        <div className="flex flex-col items-center shrink-0 w-9">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-2 ring-white z-10 transition-all duration-200',
                              'group-hover:scale-110 group-hover:ring-4',
                              config.badge
                            )}
                          >
                            <Icon size={15} strokeWidth={2.2} />
                          </div>
                          {!isLast && (
                            <div className="w-0.5 flex-1 bg-slate-100 mt-2 min-h-[32px] rounded-full" />
                          )}
                        </div>

                        {/* Content */}
                        <div
                          className={cn(
                            'flex-1 min-w-0 pt-1 transition-colors duration-200',
                            'group-hover:bg-slate-50/50 -ml-2 -mr-6 pl-2 pr-6 py-2 rounded-xl',
                            !isLast && 'pb-6'
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className={cn('text-sm leading-snug mb-0.5 flex items-center gap-2', entry.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900')}>
                                {!entry.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" aria-label="Non lue" />}
                                {humanAction(entry.action)}
                              </p>
                              {target && (
                                <p className="text-sm text-slate-600 mb-1 truncate">{target}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-600">{actor}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-xs text-slate-600 tabular-nums">{time}</span>
                              </div>
                            </div>
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

        {/* Pagination */}
        {!isLoading && total > limit && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onChange={setPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
