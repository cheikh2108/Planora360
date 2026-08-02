'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '@/lib/api';
import type { Organization, SubscriptionPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FormField, Input } from '@/components/ui/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, cn } from '@/lib/utils';
import {
  Building2, Users, CreditCard, ArrowLeft, Edit3, Trash2,
  CheckCircle2, FolderKanban, AlertCircle, Star,
} from 'lucide-react';

const PLAN_ORDER: SubscriptionPlan[] = ['DECOUVERTE', 'PROFESSIONNELLE', 'SUR_MESURE'];
const PLAN_META: Record<SubscriptionPlan, { label: string; tagline: string; color: string; bg: string; darkFrom: string; darkTo: string }> = {
  DECOUVERTE:      { label: 'Découverte',      tagline: '30 jours gratuits',           color: 'text-emerald-700', bg: 'bg-emerald-100', darkFrom: 'from-emerald-800', darkTo: 'to-emerald-700' },
  PROFESSIONNELLE: { label: 'Professionnelle', tagline: 'Pour les équipes actives',    color: 'text-blue-700',   bg: 'bg-blue-100',   darkFrom: 'from-[#0f1e38]',  darkTo: 'to-[#1a3a6e]' },
  SUR_MESURE:      { label: 'Entreprise',      tagline: 'Configuration personnalisée', color: 'text-amber-700',  bg: 'bg-amber-100',  darkFrom: 'from-amber-900',  darkTo: 'to-amber-700' },
};

type Tab = 'overview' | 'subscription';

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview',     label: 'Vue générale', icon: Building2 },
    { key: 'subscription', label: 'Abonnement',   icon: CreditCard },
  ];
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            active === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <t.icon size={15} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

function OverviewTab({ org, onEdit }: { org: Organization; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0a1628] flex items-center justify-center text-lg font-bold text-white shrink-0">
            {org.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{org.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{org.id}</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" icon={<Edit3 size={13} />} onClick={onEdit}>Modifier</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Formule',      value: PLAN_META[org.subscriptionPlan].label, icon: CreditCard },
          { label: 'Utilisateurs', value: org._count?.users ?? 0,                icon: Users },
          { label: 'Plans',        value: org._count?.actionPlans ?? 0,          icon: FolderKanban },
          { label: 'Créée le',     value: formatDate(org.createdAt),             icon: CheckCircle2 },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <s.icon size={12} />{s.label}
            </div>
            <p className="text-sm font-semibold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionTab({ org }: { org: Organization }) {
  const qc = useQueryClient();
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan | null>(null);
  const currentIdx = PLAN_ORDER.indexOf(org.subscriptionPlan);
  const currentMeta = PLAN_META[org.subscriptionPlan];

  const { mutate: changePlan, isPending } = useMutation({
    mutationFn: (plan: SubscriptionPlan) => organizationsApi.update(org.id, { subscriptionPlan: plan }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-org', org.id] });
      qc.invalidateQueries({ queryKey: ['organizations'] });
      setTargetPlan(null);
    },
  });

  return (
    <div className="space-y-5">
      <div className={cn('rounded-2xl bg-linear-to-br text-white p-6 relative overflow-hidden', currentMeta.darkFrom, currentMeta.darkTo)}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -right-2 w-28 h-28 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Formule actuelle</p>
          <h3 className="text-3xl font-bold">{currentMeta.label}</h3>
          <p className="text-sm text-white/50 mt-1">{currentMeta.tagline}</p>
          <p className="mt-3 text-xs text-white/40">Active pour <span className="text-white/70 font-medium">{org.name}</span></p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Changer la formule</p>
        <div className="space-y-2">
          {PLAN_ORDER.filter(p => p !== org.subscriptionPlan).map(plan => {
            const m = PLAN_META[plan];
            const isUpgrade = PLAN_ORDER.indexOf(plan) > currentIdx;
            return (
              <div key={plan} className={cn('flex items-center gap-4 rounded-2xl border-0 p-4', m.bg)}>
                <Star size={18} className={cn(m.color, 'shrink-0')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-bold', m.color)}>{m.label}</p>
                  <p className="text-xs text-slate-500">{m.tagline}</p>
                </div>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', isUpgrade ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                  {isUpgrade ? '↑ Upgrade' : '↓ Downgrade'}
                </span>
                <Button size="sm" variant="secondary" onClick={() => setTargetPlan(plan)}>Appliquer</Button>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={!!targetPlan} onClose={() => setTargetPlan(null)} title="Confirmer le changement" size="sm">
        {targetPlan && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Passer <strong>{org.name}</strong> de <strong>{currentMeta.label}</strong> vers <strong>{PLAN_META[targetPlan].label}</strong> ?
            </p>
            <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setTargetPlan(null)}>Annuler</Button>
              <Button loading={isPending} onClick={() => changePlan(targetPlan)}>Confirmer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function EditOrgModal({ org, onClose }: { org: Organization; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(org.name);
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => organizationsApi.update(org.id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-org', org.id] });
      qc.invalidateQueries({ queryKey: ['organizations'] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Erreur');
    },
  });

  return (
    <Modal open={true} onClose={onClose} title="Modifier l'organisation" size="sm">
      <form onSubmit={e => { e.preventDefault(); if (name.trim().length >= 2) mutate(); else setError('Nom trop court'); }} className="space-y-4">
        <FormField label="Nom" required error={error}>
          <Input value={name} onChange={e => setName(e.target.value)} error={!!error} autoFocus />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isPending}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function SuperAdminOrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: org, isLoading } = useQuery<Organization>({
    queryKey: ['super-org', id],
    queryFn: async () => { const r = await organizationsApi.get(id); return r.data; },
  });

  const { mutate: deleteOrg, isPending: deleting } = useMutation({
    mutationFn: () => organizationsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      router.push('/super-admin/organizations');
    },
  });

  if (isLoading) {
    return (
      <main className="px-4 md:px-8 py-8 space-y-4 max-w-5xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </main>
    );
  }

  if (!org) {
    return (
      <main className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
        <EmptyState icon={Building2} title="Organisation introuvable" description="Cette organisation n'existe pas ou a été supprimée." />
      </main>
    );
  }

  return (
    <main className="px-4 md:px-8 py-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={() => router.push('/super-admin/organizations')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Retour aux organisations
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{org.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {org._count?.users ?? 0} utilisateurs · {PLAN_META[org.subscriptionPlan].label}
          </p>
        </div>
        <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setDeleteOpen(true)}>
          Supprimer
        </Button>
      </div>

      <TabBar active={tab} onChange={setTab} />

      {tab === 'overview'     && <OverviewTab org={org} onEdit={() => setEditOpen(true)} />}
      {tab === 'subscription' && <SubscriptionTab org={org} />}

      {editOpen && <EditOrgModal org={org} onClose={() => setEditOpen(false)} />}

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Supprimer l'organisation" size="sm">
        <div className="space-y-4">
          <div className="flex gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              Supprimer <strong>{org.name}</strong> effacera toutes ses données. Action <strong>irréversible</strong>.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Annuler</Button>
            <Button variant="danger" loading={deleting} onClick={() => deleteOrg()}>Supprimer définitivement</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
