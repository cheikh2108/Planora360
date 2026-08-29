'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proceduresApi } from '@/lib/api';
import type { Procedure, StatusProcedure, Soumission } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency, formatDateRelative, cn } from '@/lib/utils';
import {
  ArrowLeft, Calendar, Clock, FileText, TrendingUp,
  CheckCircle2, Users, Building2, DollarSign, Send,
  XCircle, AlertCircle, ExternalLink, ChevronRight,
  Package, BadgeCheck
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/toast';

// Configuration des méthodes
const METHODE_CONFIG = {
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
  CONSULTATION: {
    label: 'Consultation',
    color: 'from-amber-500 to-orange-600',
    gradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    icon: '💬'
  },
  GRE_A_GRE: {
    label: 'Gré à gré',
    color: 'from-slate-500 to-slate-700',
    gradient: 'bg-gradient-to-br from-slate-50 to-slate-100',
    icon: '🤝'
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
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
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
    ? soumissions.reduce((sum, s) => sum + Number(s.montantPropose || 0), 0) / soumissions.length
    : 0;
  const montantMin = soumissions.length > 0
    ? Math.min(...soumissions.map(s => Number(s.montantPropose || 0)))
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
            {procedure.status === 'BROUILLON' && (
              <Button
                icon={<Send size={16} />}
                onClick={() => publishMutation.mutate()}
                loading={publishMutation.isPending}
              >
                Publier
              </Button>
            )}
            {(procedure.status === 'PUBLIEE' || procedure.status === 'EN_COURS') && (
              <Button
                variant="secondary"
                icon={<Package size={16} />}
                onClick={() => closeMutation.mutate()}
                loading={closeMutation.isPending}
              >
                Clôturer
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* Hero Card - Info principale */}
        <div className={cn(
          'rounded-3xl overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-200',
          'bg-gradient-to-r',
          methodeConfig.color
        )}>
          <div className="p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                  {methodeConfig.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                    {procedure.reference}
                  </h1>
                  <p className="text-lg text-white/90 font-medium">
                    {methodeConfig.label}
                  </p>
                </div>
              </div>
              <div className={cn(
                'px-4 py-2 rounded-xl flex items-center gap-2 border backdrop-blur-sm',
                'bg-white/20 border-white/30 text-white'
              )}>
                <StatusIcon size={16} />
                <span className="text-sm font-bold">{statusConfig.label}</span>
              </div>
            </div>

            <p className="text-lg text-white/95 mb-8 leading-relaxed">
              {procedure.objet}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                  Montant estimé
                </p>
                <p className="text-2xl font-extrabold">
                  {formatCurrency(Number(procedure.montantEstime || 0))}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                  Soumissions reçues
                </p>
                <p className="text-2xl font-extrabold">
                  {soumissions.length}
                </p>
              </div>
              {soumissions.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                    Offre la plus basse
                  </p>
                  <p className="text-2xl font-extrabold">
                    {formatCurrency(montantMin)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline des dates */}
        {(procedure.datePublication || procedure.dateLimite || procedure.dateOuverture) && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-slate-600" />
              Calendrier de la procédure
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-indigo-300 to-emerald-300" />

              <div className="space-y-8">
                {procedure.datePublication && (
                  <div className="relative flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-white shadow-sm z-10">
                      <Send size={18} className="text-slate-700" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Date de publication
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDate(procedure.datePublication)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {formatDateRelative(procedure.datePublication)}
                      </p>
                    </div>
                  </div>
                )}

                {procedure.dateLimite && (
                  <div className="relative flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center border-2 border-white shadow-sm z-10">
                      <Clock size={18} className="text-amber-700" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">
                        Date limite de dépôt
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDate(procedure.dateLimite)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {formatDateRelative(procedure.dateLimite)}
                      </p>
                    </div>
                  </div>
                )}

                {procedure.dateOuverture && (
                  <div className="relative flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center border-2 border-white shadow-sm z-10">
                      <Package size={18} className="text-emerald-700" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        Date d'ouverture des plis
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDate(procedure.dateOuverture)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {formatDateRelative(procedure.dateOuverture)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Soumissions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={20} className="text-slate-600" />
              Soumissions reçues
              <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
                {soumissions.length}
              </span>
            </h2>
            {procedure.status === 'EVALUATION' && (
              <Link href={`/passation/procedures/${id}/evaluations`}>
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Users size={16} />}
                >
                  Voir les évaluations
                  <ExternalLink size={14} />
                </Button>
              </Link>
            )}
          </div>

          {soumissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 font-medium">
                Aucune soumission reçue pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {soumissions.map((soumission, idx) => (
                <div
                  key={soumission.id}
                  className="group relative bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          #{idx + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Building2 size={16} className="text-slate-500" />
                            {soumission.fournisseur?.raisonSociale || 'Fournisseur inconnu'}
                          </h3>
                          {soumission.fournisseur?.reference && (
                            <p className="text-xs text-slate-500 font-medium">
                              Réf: {soumission.fournisseur.reference}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                            Montant proposé
                          </p>
                          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
                            {formatCurrency(Number(soumission.montantPropose || 0))}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                            Délai d'exécution
                          </p>
                          <p className="text-lg font-extrabold text-slate-900 tabular-nums">
                            {soumission.delaiExecution} jours
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                            Date de dépôt
                          </p>
                          <p className="text-lg font-extrabold text-slate-900">
                            {formatDate(soumission.dateDepot)}
                          </p>
                        </div>
                      </div>

                      {soumission.observations && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <p className="text-xs text-amber-700 font-bold mb-1 uppercase tracking-wider">
                            Observations
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {soumission.observations}
                          </p>
                        </div>
                      )}
                    </div>

                    <ChevronRight
                      size={20}
                      className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-300"
                    />
                  </div>

                  {/* Badge si meilleure offre */}
                  {Number(soumission.montantPropose) === montantMin && soumissions.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                        <BadgeCheck size={14} />
                        <span className="text-xs font-bold">Meilleure offre</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations complémentaires */}
        {procedure.cahierCharges && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-slate-600" />
              Cahier des charges
            </h2>
            <div className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {procedure.cahierCharges}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
