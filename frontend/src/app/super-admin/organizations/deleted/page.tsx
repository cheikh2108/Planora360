'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { organizationsApi } from '@/lib/api';
import type { Organization, SubscriptionPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, cn } from '@/lib/utils';
import { calculateRetentionInfo, getProgressBarColor, SOFT_DELETE_RETENTION_DAYS } from '@/lib/retention';
import {
  Building2, Users, RotateCcw, ArrowLeft, FolderKanban,
  Clock, AlertCircle, Search, Trash2,
} from 'lucide-react';

const PLAN_META: Record<SubscriptionPlan, {
  label: string; color: string; bg: string; dot: string;
}> = {
  DECOUVERTE:      {
    label: 'Découverte',
    color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500',
  },
  PROFESSIONNELLE: {
    label: 'Professionnelle',
    color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500',
  },
  SUR_MESURE:      {
    label: 'Entreprise',
    color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500',
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

export default function DeletedOrganizationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [hardDeleteId, setHardDeleteId] = useState<string | null>(null);

  const { data: orgs = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations-deleted'],
    queryFn: async () => {
      const response = await organizationsApi.getDeleted();
      return response.data;
    },
  });

  const { mutate: restore, isPending: restoring } = useMutation({
    mutationFn: (id: string) => organizationsApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations-deleted'] });
      qc.invalidateQueries({ queryKey: ['organizations'] });
      setRestoreId(null);
    },
  });

  const { mutate: hardDelete, isPending: hardDeleting } = useMutation({
    mutationFn: (id: string) => organizationsApi.hardDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations-deleted'] });
      qc.invalidateQueries({ queryKey: ['organizations'] });
      setHardDeleteId(null);
    },
  });

  const filtered = orgs.filter(o => {
    if (!search.trim()) return true;
    return o.name.toLowerCase().includes(search.toLowerCase());
  });

  const selectedOrg = orgs.find(o => o.id === restoreId || o.id === hardDeleteId);

  return (
    <main className="px-4 md:px-8 py-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/super-admin/organizations"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Retour aux organisations
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Organisations supprimées</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {orgs.length} organisation{orgs.length > 1 ? 's' : ''} en attente de suppression définitive
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700">
          <p className="font-medium text-amber-800 mb-1">Rétention de {SOFT_DELETE_RETENTION_DAYS} jours</p>
          <p className="text-slate-600">
            Les organisations supprimées sont conservées pendant {SOFT_DELETE_RETENTION_DAYS} jours avant suppression définitive.
            Vous pouvez les restaurer à tout moment pendant cette période.
          </p>
        </div>
      </div>

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
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="Aucune organisation supprimée"
            description={search ? 'Aucun résultat.' : 'Les organisations supprimées apparaîtront ici.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Organisation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Formule</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Utilisateurs</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Plans</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Supprimée le</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden xl:table-cell">Expiration</th>
                  <th className="w-28" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(org => {
                  if (!org.deletedAt) return null;
                  const retention = calculateRetentionInfo(org.deletedAt);
                  const progressColor = getProgressBarColor(retention.urgencyLevel);

                  return (
                    <tr key={org.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-500 truncate">{org.name}</p>
                            <p className="text-xs text-slate-400">{org.id.slice(0, 12)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><PlanBadge plan={org.subscriptionPlan} /></td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <Users size={13} className="text-slate-400" />
                          {org._count?.users ?? 0}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <FolderKanban size={13} className="text-slate-400" />
                          {org._count?.actionPlans ?? 0}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                        {formatDate(org.deletedAt!)}
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-16">
                            <div
                              className={cn('h-full transition-all', progressColor)}
                              style={{ width: `${retention.percentageRemaining}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 font-medium shrink-0 tabular-nums">
                            {retention.daysRemaining}j
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setRestoreId(org.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Restaurer"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => setHardDeleteId(org.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de restauration */}
      <Modal open={!!restoreId} onClose={() => setRestoreId(null)} title="Restaurer l'organisation" size="sm">
        {selectedOrg && restoreId && (
          <div className="space-y-4">
            <div className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <RotateCcw size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                <strong>{selectedOrg.name}</strong> et ses <strong>{selectedOrg._count?.users || 0} utilisateur{selectedOrg._count?.users !== 1 ? 's' : ''}</strong> seront
                réactivé{selectedOrg._count?.users !== 1 ? 's' : ''} immédiatement.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={() => setRestoreId(null)}>Annuler</Button>
              <Button
                loading={restoring}
                onClick={() => restore(restoreId!)}
                icon={<RotateCcw size={13} />}
              >
                Restaurer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de suppression définitive */}
      <Modal open={!!hardDeleteId} onClose={() => setHardDeleteId(null)} title="Supprimer définitivement" size="sm">
        {selectedOrg && hardDeleteId && (
          <div className="space-y-4">
            <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold text-red-900 mb-1">Action irréversible</p>
                <p>
                  <strong>{selectedOrg.name}</strong> et ses <strong>{selectedOrg._count?.users || 0} utilisateur{selectedOrg._count?.users !== 1 ? 's' : ''}</strong> seront
                  supprimé{selectedOrg._count?.users !== 1 ? 's' : ''} définitivement de la base de données.
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  ✅ Le nom <strong>{selectedOrg.name}</strong> et les adresses email des utilisateurs seront libérés et pourront être réutilisés.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={() => setHardDeleteId(null)}>Annuler</Button>
              <Button
                variant="danger"
                loading={hardDeleting}
                onClick={() => hardDelete(hardDeleteId!)}
                icon={<Trash2 size={13} />}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
