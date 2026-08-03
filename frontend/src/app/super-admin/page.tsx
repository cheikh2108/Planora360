'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { organizationsApi } from '@/lib/api';
import type { Organization, SubscriptionPlan } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import {
  Building2, Users, ChevronRight,
  FolderKanban, Star,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PLAN_ORDER: SubscriptionPlan[] = ['DECOUVERTE', 'PROFESSIONNELLE', 'SUR_MESURE'];
const PLAN_META: Record<SubscriptionPlan, { label: string; color: string; bg: string; bar: string }> = {
  DECOUVERTE:      { label: 'Découverte',      color: 'text-emerald-700', bg: 'bg-emerald-100', bar: 'bg-emerald-400' },
  PROFESSIONNELLE: { label: 'Professionnelle', color: 'text-blue-700',   bg: 'bg-blue-100',   bar: 'bg-blue-500' },
  SUR_MESURE:      { label: 'Entreprise',      color: 'text-amber-700',  bg: 'bg-amber-100',  bar: 'bg-amber-500' },
};

export default function SuperAdminDashboard() {
  const { data: orgs = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => { const r = await organizationsApi.list(); return r.data; },
  });

  const totalUsers   = orgs.reduce((s, o) => s + (o._count?.users ?? 0), 0);
  const totalPlans   = orgs.reduce((s, o) => s + (o._count?.actionPlans ?? 0), 0);
  const byPlan = PLAN_ORDER.reduce<Record<SubscriptionPlan, number>>((acc, p) => {
    acc[p] = orgs.filter(o => o.subscriptionPlan === p).length;
    return acc;
  }, {} as Record<SubscriptionPlan, number>);

  const recent = [...orgs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <main className="px-4 md:px-8 py-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vue d'ensemble</h1>
        <p className="text-sm text-slate-500 mt-0.5">Tableau de bord de la plateforme ATAABA Pilot</p>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {[
            { label: 'Organisations',   value: orgs.length,  icon: Building2,    color: 'text-[#0f1e38]',  bg: 'bg-[#0f1e38]/8' },
            { label: 'Utilisateurs',    value: totalUsers,   icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: "Plans d'action",  value: totalPlans,   icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Formules actives', value: orgs.length, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-3 md:p-5">
              <div className={cn('w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2 md:mb-3', s.bg)}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par formule */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">Répartition par formule</h2>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : (
            <div className="space-y-3">
              {PLAN_ORDER.map(p => {
                const m = PLAN_META[p];
                const count = byPlan[p];
                const pct = orgs.length ? Math.round((count / orgs.length) * 100) : 0;
                return (
                  <div key={p}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn('text-xs font-semibold', m.color)}>{m.label}</span>
                      <span className="text-xs text-slate-500">{count} org{count > 1 ? 's' : ''} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', m.bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Organisations récentes */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Dernières organisations</h2>
            <Link href="/super-admin/organizations" className="text-xs text-[#2563eb] hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : recent.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">Aucune organisation</div>
          ) : (
            <div>
              {recent.map(org => {
                const m = PLAN_META[org.subscriptionPlan];
                return (
                  <Link
                    key={org.id}
                    href={`/super-admin/organizations/${org.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0f1e38] flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{org.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(org.createdAt)}</p>
                    </div>
                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', m.bg, m.color)}>
                      {m.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
