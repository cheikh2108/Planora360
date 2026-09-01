'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proceduresApi } from '@/lib/api';
import type { Procedure, StatusProcedure, Soumission } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EditProcedureModal } from '@/components/passation/EditProcedureModal';
import { CreateSoumissionModal } from '@/components/passation/CreateSoumissionModal';
import { ChangeStatusModal } from '@/components/passation/ChangeStatusModal';
import { formatDate, formatCurrency, formatDateRelative, cn } from '@/lib/utils';
import {
  ArrowLeft, Calendar, Clock, FileText, TrendingUp,
  CheckCircle2, Users, Building2, DollarSign, Send,
  XCircle, AlertCircle, ExternalLink, ChevronRight,
  Package, BadgeCheck, Gavel, Edit
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Configuration des méthodes
const METHODE_CONFIG = {
  ACHAT_DIRECT: {
    label: 'Achat Direct',
    color: 'from-blue-500 to-blue-600',
    gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    icon: '⚡'
  },
  DEMANDE_COTATION: {
    label: 'Demande de Cotation',
    color: 'from-cyan-500 to-cyan-600',
    gradient: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
    icon: '💰'
  },
  CONSULTATION_RESTREINTE: {
    label: 'Consultation Restreinte',
    color: 'from-amber-500 to-orange-600',
    gradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    icon: '💬'
  },
  APPEL_OFFRES_OUVERT: {
    label: 'Appel d\'Offres Ouvert',
    color: 'from-emerald-500 to-teal-600',
    gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    icon: '📢'
  },
  APPEL_OFFRES_RESTREINT: {
    label: 'Appel d\'Offres Restreint',
    color: 'from-violet-500 to-purple-600',
    gradient: 'bg-gradient-to-br from-violet-50 to-purple-50',
    icon: '🎯'
  },
  DEMANDE_PROPOSITIONS: {
    label: 'Demande de Propositions',
    color: 'from-indigo-500 to-indigo-600',
    gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    icon: '📝'
  },
  MANIFESTATION_INTERET: {
    label: 'Manifestation d\'Intérêt',
    color: 'from-pink-500 to-pink-600',
    gradient: 'bg-gradient-to-br from-pink-50 to-pink-100',
    icon: '✋'
  },
  SELECTION_CONSULTANT: {
    label: 'Sélection de Consultant',
    color: 'from-purple-500 to-purple-600',
    gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
    icon: '👔'
  },
  PROCEDURE_URGENCE: {
    label: 'Procédure d\'Urgence',
    color: 'from-red-500 to-red-600',
    gradient: 'bg-gradient-to-br from-red-50 to-red-100',
    icon: '🚨'
  },
  AUTRE: {
    label: 'Autre',
    color: 'from-gray-500 to-gray-600',
    gradient: 'bg-gradient-to-br from-gray-50 to-gray-100',
    icon: '📋'
  },
};

// Configuration des statuts
const STATUS_CONFIG: Record<StatusProcedure, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: any;
}> = {
  BROUILLON: {
    label: 'Brouillon',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: FileText
  },
  PUBLIEE: {
    label: 'Publiée',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: TrendingUp
  },
  EN_COURS: {
    label: 'En cours',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: Clock
  },
  CLOTUREE_OFFRES: {
    label: 'Clôturée',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: Package
  },
  EVALUATION: {
    label: 'Évaluation',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: Users
  },
  ATTRIBUEE: {
    label: 'Attribuée',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle2
  },
  INFRUCTUEUSE: {
    label: 'Infructueuse',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: AlertCircle
  },
  ANNULEE: {
    label: 'Annulée',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: XCircle
  },
};

export default function ProcedureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [soumissionModalOpen, setSoumissionModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);

  const { data: procedure, isLoading } = useQuery({
    queryKey: ['procedures', id],
    queryFn: async () => {
      const res = await proceduresApi.getOne(id);
      return res.data as Procedure;
    },
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () => proceduresApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures', id] });
      toast.success('Procédure publiée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la publication');
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => proceduresApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures', id] });
      toast.success('Procédure clôturée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la clôture');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
        <Header title="Chargement..." />
        <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </main>
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
        <Header title="Procédure introuvable" />
        <main className="flex-1 px-4 md:px-6 py-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Procédure introuvable</h3>
            <p className="text-slate-600 mb-6">Cette procédure n'existe pas ou a été supprimée.</p>
            <Button onClick={() => router.push('/passation/procedures')}>
              Retour aux procédures
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const methodeConfig = METHODE_CONFIG[procedure.methode];
  const statusConfig = STATUS_CONFIG[procedure.status];
  const StatusIcon = statusConfig.icon;
  const soumissions = procedure.soumissions || [];

  // Calculer les stats
  const montantMoyen = soumissions.length > 0
    ? soumissions.reduce((sum, s) => sum + Number(s.montantTotal || 0), 0) / soumissions.length
    : 0;
  const montantMin = soumissions.length > 0
    ? Math.min(...soumissions.map(s => Number(s.montantTotal || 0)))
    : 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
      <Header
        title={procedure.reference}
        subtitle={methodeConfig.label}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              icon={<ArrowLeft size={16} />}
              onClick={() => router.push('/passation/procedures')}
            >
              Retour
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChangeStatusModalOpen(true)}
            >
              Changer le statut
            </Button>
            {procedure.status === 'BROUILLON' && (
              <>
                <Button
                  variant="secondary"
                  icon={<Edit size={16} />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Modifier
                </Button>
                <Button
                  icon={<Send size={16} />}
                  onClick={() => publishMutation.mutate()}
                  isLoading={publishMutation.isPending}
                >
                  Publier
                </Button>
              </>
            )}
            {(procedure.status === 'PUBLIEE' || procedure.status === 'EN_COURS') && (
              <Button
                variant="secondary"
                icon={<Package size={16} />}
                onClick={() => closeMutation.mutate()}
                isLoading={closeMutation.isPending}
              >
                Clôturer
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Status & Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                  <Gavel className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{procedure.reference}</h1>
                  <p className="text-sm text-slate-500 mt-0.5">{methodeConfig.label}</p>
                </div>
              </div>
              <div className={cn(
                'px-3 py-1.5 rounded-lg flex items-center gap-2',
                statusConfig.bg,
                statusConfig.border,
                'border'
              )}>
                <StatusIcon size={14} className={statusConfig.color} />
                <span className={cn('text-xs font-semibold uppercase tracking-wide', statusConfig.color)}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Objet */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
                Objet de la procédure
              </p>
              <p className="text-base text-slate-900">{procedure.objet}</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
                  Montant estimé
                </p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {formatCurrency(Number(procedure.montantEstimatif || 0))}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
                  Soumissions reçues
                </p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {soumissions.length}
                </p>
              </div>
              {soumissions.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
                    Offre la plus basse
                  </p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {formatCurrency(montantMin)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline des dates */}
          {(procedure.datePublication || procedure.dateLimite || procedure.dateOuverture) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar size={16} className="text-slate-600" />
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Calendrier
                </h2>
              </div>

              <div className="space-y-4">
                {procedure.datePublication && (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Send size={16} className="text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Date de publication</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(procedure.datePublication)}</p>
                    </div>
                  </div>
                )}

                {procedure.dateLimite && (
                  <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-amber-600">Date limite</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(procedure.dateLimite)}</p>
                    </div>
                  </div>
                )}

                {procedure.dateOuverture && (
                  <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-emerald-600">Ouverture des plis</p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(procedure.dateOuverture)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Soumissions */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-600" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Soumissions reçues
                </p>
                <span className="text-xs tabular-nums text-slate-600">({soumissions.length})</span>
              </div>
              {(procedure.status === 'PUBLIEE' || procedure.status === 'EN_COURS') && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSoumissionModalOpen(true)}
                >
                  Nouvelle soumission
                </Button>
              )}
            </div>

            {soumissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={32} className="mx-auto mb-4 text-slate-300" />
                <p className="text-sm text-slate-500">Aucune soumission reçue</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {soumissions.map((soumission, idx) => (
                  <div key={soumission.id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-slate-600">#{idx + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {soumission.fournisseur?.raisonSociale || 'Fournisseur inconnu'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(soumission.dateDepot)}
                          </p>
                        </div>
                      </div>
                      {Number(soumission.montantTotal) === montantMin && soumissions.length > 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                          <BadgeCheck size={12} />
                          Meilleure offre
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">
                          Montant Total
                        </p>
                        <p className="text-sm font-bold text-slate-900 tabular-nums">
                          {formatCurrency(Number(soumission.montantTotal || 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">
                          Devise
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {soumission.devise || 'XOF'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">
                          Statut
                        </p>
                        <p className="text-xs font-semibold text-slate-600 uppercase">
                          {soumission.status || 'DEPOSEE'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

          {/* Informations complémentaires */}
          {procedure.cahierCharges && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-slate-600" />
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Cahier des charges
                </h2>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {procedure.cahierCharges}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de modification */}
      {procedure && (
        <EditProcedureModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          procedure={procedure}
        />
      )}

      {/* Modal de création de soumission */}
      <CreateSoumissionModal
        open={soumissionModalOpen}
        onClose={() => setSoumissionModalOpen(false)}
        procedureId={id}
      />

      {/* Modal de changement de statut */}
      {procedure && (
        <ChangeStatusModal
          open={changeStatusModalOpen}
          onClose={() => setChangeStatusModalOpen(false)}
          procedureId={id}
          currentStatus={procedure.status}
        />
      )}
    </div>
  );
}
