'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import {
  Bell, CheckCircle2, XCircle, Upload, UserPlus, Edit3,
  AlertTriangle, GitBranch, Send, Shield, CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const ACTION_CONFIG: Record<string, { icon: React.ElementType; badge: string; dot: string; label: string }> = {
  SUBMIT:                { icon: Send,         badge: 'bg-blue-500/15 text-blue-400',     dot: 'bg-blue-500',    label: 'Soumission' },
  'validation.submitted':{ icon: Send,         badge: 'bg-blue-500/15 text-blue-400',     dot: 'bg-blue-500',    label: 'Soumission validation' },
  APPROVE:               { icon: CheckCircle2, badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Approuvé' },
  'validation.approuve': { icon: CheckCircle2, badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500', label: 'Validation approuvée' },
  REJECT:                { icon: XCircle,      badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Rejeté' },
  'validation.rejete':   { icon: XCircle,      badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Validation rejetée' },
  VALIDATE:              { icon: GitBranch,    badge: 'bg-teal-500/15 text-teal-400',     dot: 'bg-teal-500',    label: 'Validé' },
  UPLOAD:                { icon: Upload,       badge: 'bg-purple-500/15 text-purple-400', dot: 'bg-purple-500',  label: 'Document ajouté' },
  CREATE_USER:           { icon: UserPlus,     badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Utilisateur créé' },
  CREATE:                { icon: UserPlus,     badge: 'bg-indigo-500/15 text-indigo-400', dot: 'bg-indigo-500',  label: 'Création' },
  UPDATE:                { icon: Edit3,        badge: 'bg-slate-500/15 text-slate-400',   dot: 'bg-slate-500',   label: 'Mise à jour' },
  STATUS_CHANGE:         { icon: AlertTriangle,badge: 'bg-amber-500/15 text-amber-400',   dot: 'bg-amber-500',   label: 'Statut modifié' },
  DELETE:                { icon: XCircle,      badge: 'bg-red-500/15 text-red-400',       dot: 'bg-red-500',     label: 'Suppression' },
};

const DEFAULT_CONFIG = { icon: Shield, badge: 'bg-slate-500/15 text-slate-400', dot: 'bg-slate-500' };

function humanAction(action: string): string {
  const config = ACTION_CONFIG[action];
  if (config) return config.label;
  return action.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} j`;
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<number>(() => {
    try { return Number(localStorage.getItem('notif-last-read-at') ?? 0); } catch { return 0; }
  });
  const ref = useRef<HTMLDivElement>(null);

  const { data: entries = [] } = useQuery<AuditEntry[]>({
    queryKey: ['audit-notifications'],
    queryFn: async () => { const r = await auditApi.list({ limit: 20 }); return r.data; },
    refetchInterval: 30_000,
  });

  const unread = entries.filter(e => new Date(e.createdAt).getTime() > lastReadAt).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function markAllRead() {
    const now = Date.now();
    setLastReadAt(now);
    try { localStorage.setItem('notif-last-read-at', String(now)); } catch {}
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'relative p-2 rounded-xl transition-colors',
          open ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
        )}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Overlay mobile */}
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="fixed inset-x-3 top-[72px] md:absolute md:inset-x-auto md:right-0 md:top-12 md:w-[340px] bg-[#0f1e38] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/8 z-50 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-400" />
                <span className="text-sm font-bold text-white tracking-[-0.01em]">Notifications</span>
                {unread > 0 && (
                  <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {unread}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-white transition-colors"
                >
                  <CheckCheck size={12} />
                  Tout lire
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/6 mx-4" />

            {/* List */}
            <div className="overflow-y-auto max-h-[360px]">
              {entries.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Bell size={18} className="text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Aucune notification</p>
                </div>
              ) : (
                <div className="py-1">
                  {entries.map(entry => {
                    const cfg = ACTION_CONFIG[entry.action] ?? DEFAULT_CONFIG;
                    const Icon = cfg.icon;
                    const isRead = new Date(entry.createdAt).getTime() <= lastReadAt;
                    const actor = entry.user
                      ? `${entry.user.firstName} ${entry.user.lastName}`
                      : 'Système';
                    const target = (entry.metadata as Record<string, string>)?.title;

                    return (
                      <div
                        key={entry.id}
                        onClick={() => {
                          const t = new Date(entry.createdAt).getTime();
                          if (t > lastReadAt) {
                            setLastReadAt(t);
                            try { localStorage.setItem('notif-last-read-at', String(t)); } catch {}
                          }
                        }}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                          'hover:bg-white/5',
                          !isRead && 'border-l-2 border-blue-500 pl-[14px]'
                        )}
                      >
                        {/* Icon badge */}
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', cfg.badge)}>
                          <Icon size={13} strokeWidth={2.2} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={cn(
                              'text-xs leading-snug truncate',
                              isRead ? 'font-medium text-slate-400' : 'font-semibold text-white'
                            )}>
                              {humanAction(entry.action)}
                            </p>
                            <span className="text-[10px] text-slate-600 shrink-0 tabular-nums">
                              {relativeTime(entry.createdAt)}
                            </span>
                          </div>
                          {(target || actor) && (
                            <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                              {target ? <><span className="text-slate-400 font-medium">{target}</span> · </> : ''}{actor}
                            </p>
                          )}
                        </div>

                        {/* Unread dot */}
                        {!isRead && (
                          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-2', cfg.dot)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="h-px bg-white/6" />
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              Voir toute l'activité →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
