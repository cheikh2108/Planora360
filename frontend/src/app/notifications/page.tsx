'use client';

import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, cn } from '@/lib/utils';
import {
  Bell, CheckCircle2, XCircle, Upload, UserPlus, Edit3,
  AlertTriangle, GitBranch, Send, Shield,
} from 'lucide-react';

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  SUBMIT: { icon: Send, color: 'bg-blue-100 text-blue-600', label: 'Soumission' },
  APPROVE: { icon: CheckCircle2, color: 'bg-green-100 text-green-600', label: 'Approuvé' },
  REJECT: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Rejeté' },
  VALIDATE: { icon: GitBranch, color: 'bg-teal-100 text-teal-600', label: 'Validé' },
  UPLOAD: { icon: Upload, color: 'bg-purple-100 text-purple-600', label: 'Document' },
  CREATE_USER: { icon: UserPlus, color: 'bg-indigo-100 text-indigo-600', label: 'Utilisateur créé' },
  UPDATE: { icon: Edit3, color: 'bg-slate-100 text-slate-500', label: 'Mise à jour' },
  STATUS_CHANGE: { icon: AlertTriangle, color: 'bg-amber-100 text-amber-600', label: 'Changement de statut' },
};

export default function NotificationsPage() {
  const { data: entries = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ['audit-notifications'],
    queryFn: async () => {
      const r = await auditApi.list({ limit: 50 });
      return r.data;
    },
    refetchInterval: 30_000,
  });

  const grouped = entries.reduce<Record<string, AuditEntry[]>>((acc, e) => {
    const day = new Date(e.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Notifications" subtitle="Journal des événements de votre organisation" />
      <main className="flex-1 px-4 md:px-6 py-6 max-w-3xl">

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Les événements de votre organisation apparaîtront ici."
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([day, dayEntries]) => (
              <div key={day}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 capitalize">{day}</p>
                <div className="space-y-2">
                  {dayEntries.map(entry => {
                    const config = ACTION_CONFIG[entry.action] ?? { icon: Shield, color: 'bg-slate-100 text-slate-500', label: entry.action };
                    const Icon = config.icon;
                    const actor = entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Système';
                    const target = (entry.metadata as Record<string, string>)?.title ?? entry.entityType;
                    const time = new Date(entry.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={entry.id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
                        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', config.color)}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-slate-800">
                              <span className="font-semibold">{actor}</span>
                              {' — '}
                              <span className="text-slate-600">{config.label}</span>
                              {target && <span className="text-slate-500"> · {target}</span>}
                            </p>
                            <span className="text-xs text-slate-400 shrink-0">{time}</span>
                          </div>
                          {entry.entityType && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {entry.entityType} #{entry.entityId.slice(0, 8)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
