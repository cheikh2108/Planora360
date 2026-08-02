'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { organizationsApi } from '@/lib/api';
import type { Organization, SubscriptionPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input } from '@/components/ui/form-field';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, cn } from '@/lib/utils';
import {
  Building2, Plus, Search, Users, FolderKanban,
  ChevronRight, Trash2, AlertCircle, Sparkles, CheckCircle2,
} from 'lucide-react';

const PLAN_ORDER: SubscriptionPlan[] = ['DECOUVERTE', 'PROFESSIONNELLE', 'SUR_MESURE'];

const PLAN_META: Record<SubscriptionPlan, {
  label: string; color: string; bg: string; dot: string;
  description: string; limits: string[]; badge?: string;
}> = {
  DECOUVERTE:      {
    label: 'Découverte',
    color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500',
    description: 'Essai gratuit 30 jours, sans engagement',
    badge: '30 jours gratuits',
    limits: ['2 plans d\'action', '5 utilisateurs', 'Fonctionnalités de base'],
  },
  PROFESSIONNELLE: {
    label: 'Professionnelle',
    color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500',
    description: 'Pour les organisations en croissance',
    limits: ['Plans illimités', '50 utilisateurs', 'Rapports avancés', 'Export PDF/Excel'],
  },
  SUR_MESURE:      {
    label: 'Entreprise',
    color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500',
    description: 'Solution sur mesure pour les grandes structures',
    limits: ['Tout illimité', 'SLA dédié', 'Intégrations personnalisées', 'Support prioritaire'],
  },
};

function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  const m = PLAN_META[plan];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', m.bg, m.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

function StatsBar({ orgs }: { orgs: Organization[] }) {
  const byPlan = PLAN_ORDER.reduce<Record<SubscriptionPlan, number>>((acc, p) => {
    acc[p] = orgs.filter(o => o.subscriptionPlan === p).length;
    return acc;
  }, {} as Record<SubscriptionPlan, number>);
  const totalUsers = orgs.reduce((s, o) => s + (o._count?.users ?? 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:col-span-2">
        <p className="text-xs text-slate-500 mb-1">Total organisations</p>
        <p className="text-3xl font-bold text-slate-900">{orgs.length}</p>
        <p className="text-xs text-slate-400 mt-0.5">{totalUsers} utilisateurs</p>
      </div>
      {PLAN_ORDER.map(p => {
        const m = PLAN_META[p];
        return (
          <div key={p} className={cn('rounded-2xl border-0 p-4', m.bg)}>
            <p className={cn('text-xs font-semibold mb-1', m.color)}>{m.label}</p>
            <p className={cn('text-2xl font-bold', m.color)}>{byPlan[p]}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function SuperAdminOrganizationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | 'ALL'>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);

  const { data: orgs = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => { const r = await organizationsApi.list(); return r.data; },
  });

  const { mutate: deleteOrg, isPending: deleting } = useMutation({
    mutationFn: (id: string) => organizationsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organizations'] }); setDeleteTarget(null); },
  });

  const filtered = orgs.filter(o => {
    const matchSearch = !search.trim() || o.name.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'ALL' || o.subscriptionPlan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <main className="px-4 md:px-8 py-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organisations</h1>
        <p className="text-sm text-slate-500 mt-0.5">{orgs.length} organisation{orgs.length > 1 ? 's' : ''} clientes</p>
      </div>

      {!isLoading && orgs.length > 0 && <StatsBar orgs={orgs} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une organisation..."
            className="w-full h-9 pl-8 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', ...PLAN_ORDER] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={cn(
                'h-9 px-3 rounded-xl text-xs font-medium transition-colors',
                planFilter === p
                  ? 'bg-[#0a1628] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {p === 'ALL' ? 'Toutes' : PLAN_META[p].label}
            </button>
          ))}
        </div>
        <Button size="sm" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          Nouvelle organisation
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Building2} title="Aucune organisation" description={search || planFilter !== 'ALL' ? 'Aucun résultat.' : 'Créez la première organisation.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Organisation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Formule</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Utilisateurs</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Plans</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Créée le</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(org => (
                  <tr key={org.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0a1628] flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{org.name}</p>
                          <p className="text-xs text-slate-400">{org.id.slice(0, 12)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><PlanBadge plan={org.subscriptionPlan} /></td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Users size={13} className="text-slate-400" />{org._count?.users ?? 0}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <FolderKanban size={13} className="text-slate-400" />{org._count?.actionPlans ?? 0}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">{formatDate(org.createdAt)}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDeleteTarget(org)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <Link
                          href={`/super-admin/organizations/${org.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateOrgModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer l'organisation" size="sm">
        <div className="space-y-4">
          <div className="flex gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              Supprimer <strong>{deleteTarget?.name}</strong> effacera toutes ses données. Action <strong>irréversible</strong>.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" loading={deleting} onClick={() => deleteTarget && deleteOrg(deleteTarget.id)}>
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

const EMPTY_FORM = {
  name: '',
  subscriptionPlan: 'DECOUVERTE' as SubscriptionPlan,
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
};

function CreateOrgModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: () => organizationsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      onClose();
      setForm(EMPTY_FORM);
      setErrors({});
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrors({ submit: typeof msg === 'string' ? msg : 'Erreur lors de la création' });
    },
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Nom requis (2 caractères minimum)';
    if (!form.adminFirstName.trim()) e.adminFirstName = 'Prénom requis';
    if (!form.adminLastName.trim()) e.adminLastName = 'Nom requis';
    if (!form.adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail))
      e.adminEmail = 'Email valide requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle organisation" size="md">
      <form onSubmit={e => { e.preventDefault(); if (validate()) mutate(); }} className="space-y-4">

        <FormField label="Nom de l'organisation" required error={errors.name}>
          <Input value={form.name} onChange={set('name')} placeholder="Ex : Ministère de l'Eau" error={!!errors.name} autoFocus />
        </FormField>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Formule d&apos;abonnement</p>
          <div className="grid grid-cols-1 gap-2">
            {PLAN_ORDER.map(p => {
              const m = PLAN_META[p];
              const selected = form.subscriptionPlan === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, subscriptionPlan: p }))}
                  className={cn(
                    'w-full text-left rounded-xl border px-4 py-3 transition-all cursor-pointer',
                    selected
                      ? 'border-[#2563eb] bg-[#eef5ff] ring-1 ring-[#2563eb]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', m.bg, m.color)}>
                          {m.label}
                        </span>
                        {m.badge && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                            <Sparkles size={10} />
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{m.description}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                        {m.limits.map(l => (
                          <span key={l} className="flex items-center gap-1 text-[10px] text-slate-500">
                            <CheckCircle2 size={9} className="text-slate-300 shrink-0" />
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-all',
                      selected ? 'border-[#2563eb] bg-[#2563eb]' : 'border-slate-300'
                    )} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Séparateur admin */}
        <div className="pt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-[#2563eb] pl-2">
            Compte administrateur
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Prénom" required error={errors.adminFirstName}>
              <Input value={form.adminFirstName} onChange={set('adminFirstName')} placeholder="Prénom" error={!!errors.adminFirstName} />
            </FormField>
            <FormField label="Nom" required error={errors.adminLastName}>
              <Input value={form.adminLastName} onChange={set('adminLastName')} placeholder="Nom" error={!!errors.adminLastName} />
            </FormField>
          </div>
          <FormField label="Adresse e-mail" required error={errors.adminEmail} className="mt-3">
            <Input type="email" value={form.adminEmail} onChange={set('adminEmail')} placeholder="admin@organisation.com" error={!!errors.adminEmail} />
          </FormField>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] inline-block shrink-0" />
            Un mot de passe temporaire sera envoyé par email.
          </p>
        </div>

        {errors.submit && <p className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-200">{errors.submit}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isPending} icon={<Plus size={14} />}>Créer l&apos;organisation</Button>
        </div>
      </form>
    </Modal>
  );
}
