'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '@/lib/api';
import type { Organization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, cn } from '@/lib/utils';
import { Building2, Users, RotateCcw, ArrowLeft, FolderKanban, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const PLAN_META = {
  DECOUVERTE: { label: 'Découverte', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  PROFESSIONNELLE: { label: 'Professionnelle', color: 'text-blue-700', bg: 'bg-blue-50' },
  SUR_MESURE: { label: 'Entreprise', color: 'text-amber-700', bg: 'bg-amber-50' },
};

export default function DeletedOrganizationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const { data: orgs, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations-deleted'],
    queryFn: async () => {
      const response = await organizationsApi.getDeleted();
      return response.data;
    },
  });

  const { mutate: restore, isPending: restoring } = useMutation({
    mutationFn: (id: string) => organizationsApi.restore(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['organizations-deleted'] });
      qc.invalidateQueries({ queryKey: ['organizations'] });
      setRestoreId(null);

      // Toast de succès (si vous avez un système de toast)
      console.log(`✅ ${data.data.message} (${data.data.usersRestored} utilisateurs)`);
    },
  });

  const selectedOrg = orgs?.find(o => o.id === restoreId);

  if (isLoading) {
    return (
      <main className="px-4 md:px-8 py-8 space-y-4 max-w-7xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </main>
    );
  }

  return (
    <main className="px-4 md:px-8 py-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/super-admin/organizations')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Retour aux organisations actives
        </button>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Organisations supprimées</h1>
            <p className="text-sm text-slate-500 mt-1">
              {orgs?.length || 0} organisation{orgs?.length !== 1 ? 's' : ''} en attente de suppression définitive
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700">
          <p className="font-medium mb-1">Rétention de 90 jours</p>
          <p className="text-slate-600">
            Les organisations supprimées sont conservées pendant 90 jours avant suppression définitive.
            Vous pouvez les restaurer à tout moment pendant cette période.
          </p>
        </div>
      </div>

      {/* Liste des organisations supprimées */}
      {!orgs || orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucune organisation supprimée"
          description="Les organisations supprimées apparaîtront ici et pourront être restaurées pendant 90 jours."
        />
      ) : (
        <div className="grid gap-4">
          {orgs.map(org => {
            const planMeta = PLAN_META[org.subscriptionPlan];
            const deletedDaysAgo = org.deletedAt
              ? Math.floor((Date.now() - new Date(org.deletedAt).getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            const daysRemaining = 90 - deletedDaysAgo;

            return (
              <div
                key={org.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{org.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {org._count?.users || 0} utilisateurs
                        </span>
                        <span className="flex items-center gap-1">
                          <FolderKanban size={12} />
                          {org._count?.actionPlans || 0} plans
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-full font-medium', planMeta.bg, planMeta.color)}>
                          {planMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Supprimée le {formatDate(org.deletedAt!)} · <strong className="text-slate-600">{daysRemaining} jours restants</strong>
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<RotateCcw size={13} />}
                    onClick={() => setRestoreId(org.id)}
                  >
                    Restaurer
                  </Button>
                </div>

                {/* Barre de progression temps restant */}
                <div className="mt-4">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        daysRemaining > 60 ? 'bg-green-500' :
                        daysRemaining > 30 ? 'bg-amber-500' :
                        'bg-red-500'
                      )}
                      style={{ width: `${(daysRemaining / 90) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation de restauration */}
      <Modal
        open={!!restoreId}
        onClose={() => setRestoreId(null)}
        title="Restaurer l'organisation"
        size="sm"
      >
        {selectedOrg && (
          <div className="space-y-4">
            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">Restauration complète</p>
                <p>
                  <strong>{selectedOrg.name}</strong> et ses <strong>{selectedOrg._count?.users || 0} utilisateurs</strong> seront
                  réactivés immédiatement.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" onClick={() => setRestoreId(null)}>
                Annuler
              </Button>
              <Button
                icon={<RotateCcw size={13} />}
                loading={restoring}
                onClick={() => restore(restoreId!)}
              >
                Restaurer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
