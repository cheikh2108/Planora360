'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { contratsApi } from '@/lib/api';
import { formatCurrency, formatDate, formatDateRelative, cn } from '@/lib/utils';
import type { Contrat, ContratDashboard, StatusContrat, Livrable, PaiementContrat, Avenant } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressBar } from '@/components/ui/progress-bar';
import {
  ArrowLeft, FileText, TrendingUp, DollarSign, CheckCircle2,
  Clock, AlertTriangle, XCircle, Calendar, Building2,
  Package, CreditCard, FileEdit, Activity, Edit, Trash2,
  Download, Eye, Check, AlertCircle, MinusCircle
} from 'lucide-react';
import Link from 'next/link';

// Configuration des statuts
const STATUS_CONFIG: Record<StatusContrat, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: any;
  gradient: string;
}> = {
  SIGNE: {
    label: 'Signé',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: FileText,
    gradient: 'from-cyan-500 to-blue-600'
  },
  EN_COURS: {
    label: 'En cours',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: Activity,
    gradient: 'from-emerald-500 to-teal-600'
  },
  SUSPENDU: {
    label: 'Suspendu',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-amber-600'
  },
  RESILIE: {
    label: 'Résilié',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
    gradient: 'from-red-500 to-rose-600'
  },
  TERMINE: {
    label: 'Terminé',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle2,
    gradient: 'from-green-500 to-emerald-600'
  },
  ARCHIVE: {
    label: 'Archivé',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: FileText,
    gradient: 'from-slate-400 to-slate-600'
  },
};

// Status Livrable
const LIVRABLE_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  EN_ATTENTE: { label: 'En attente', color: 'text-slate-600 bg-slate-100', icon: Clock },
  EN_COURS: { label: 'En cours', color: 'text-blue-700 bg-blue-100', icon: Activity },
  SOUMIS: { label: 'Soumis', color: 'text-purple-700 bg-purple-100', icon: Eye },
  VALIDE: { label: 'Validé', color: 'text-green-700 bg-green-100', icon: CheckCircle2 },
  REJETE: { label: 'Rejeté', color: 'text-red-700 bg-red-100', icon: XCircle },
};

// Status Paiement
const PAIEMENT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  EN_ATTENTE: { label: 'En attente', color: 'text-slate-600 bg-slate-100', icon: Clock },
  PROGRAMME: { label: 'Programmé', color: 'text-blue-700 bg-blue-100', icon: Calendar },
  EN_TRAITEMENT: { label: 'En traitement', color: 'text-purple-700 bg-purple-100', icon: Activity },
  EFFECTUE: { label: 'Effectué', color: 'text-green-700 bg-green-100', icon: CheckCircle2 },
  ANNULE: { label: 'Annulé', color: 'text-red-700 bg-red-100', icon: XCircle },
};

const getProgressColor = (rate: number): string => {
  if (rate >= 90) return 'bg-gradient-to-r from-emerald-500 to-green-600';
  if (rate >= 70) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
  if (rate >= 50) return 'bg-gradient-to-r from-amber-500 to-orange-600';
  if (rate >= 30) return 'bg-gradient-to-r from-orange-500 to-red-600';
  return 'bg-gradient-to-r from-red-500 to-rose-600';
};

export default function ContratDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<'livrables' | 'paiements' | 'avenants'>('livrables');

  // Fetch contrat
  const { data: contratData, isLoading } = useQuery({
    queryKey: ['contrat', id],
    queryFn: async () => {
      const res = await contratsApi.getOne(id);
      return res.data as Contrat;
    },
    enabled: !!id,
  });

  // Fetch dashboard
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['contrat-dashboard', id],
    queryFn: async () => {
      const res = await contratsApi.getDashboard(id);
      return res.data as ContratDashboard;
    },
    enabled: !!id,
  });

  const contrat = contratData;
  const dashboard = dashboardData;
  const stats = dashboard?.statistiques;

  if (isLoading || isLoadingDashboard) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
        <Header title="Chargement..." />
        <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
          <Skeleton className="h-48 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!contrat) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
        <Header title="Contrat introuvable" />
        <main className="flex-1 px-4 md:px-6 py-6">
          <div className="text-center py-12">
            <p className="text-slate-500">Le contrat demandé n'existe pas.</p>
            <Button onClick={() => router.push('/passation/contrats')} className="mt-4">
              Retour à la liste
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[contrat.status];
  const StatusIcon = statusConfig.icon;
  const montantTotal = Number(contrat.montantRevise || contrat.montantInitial);
  const isOverdue = new Date(contrat.dateEcheance) < new Date() && contrat.status === 'EN_COURS';

  // Timeline dates
  const timelineDates = [
    { label: 'Signature', date: contrat.dateSignature, icon: FileText, completed: true },
    { label: 'Démarrage', date: contrat.dateDemarrage, icon: Activity, completed: !!contrat.dateDemarrage },
    { label: 'Échéance', date: contrat.dateEcheance, icon: Calendar, completed: false, isDeadline: true },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
      <Header
        title={contrat.reference}
        subtitle={contrat.procedure?.objet || 'Contrat'}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={() => {}}
            >
              Exporter
            </Button>
            <Button
              icon={<Edit size={16} />}
              onClick={() => router.push(`/passation/contrats/${id}/edit`)}
            >
              Modifier
            </Button>
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* Back button */}
        <Link
          href="/passation/contrats"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux contrats
        </Link>

        {/* Header Card - Informations principales */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-br from-slate-50 to-slate-100/50 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                  statusConfig.gradient
                )}>
                  <FileText size={28} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{contrat.reference}</h2>
                    <div className={cn(
                      'px-3 py-1.5 rounded-xl flex items-center gap-2 border',
                      statusConfig.bg,
                      statusConfig.color,
                      statusConfig.border
                    )}>
                      <StatusIcon size={16} />
                      <span className="text-sm font-bold">{statusConfig.label}</span>
                    </div>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-200">
                        <AlertCircle size={12} />
                        En retard
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 size={16} />
                    <span className="font-medium">{contrat.fournisseur?.raisonSociale || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Montant Total
                </p>
                <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(montantTotal)}
                </p>
                {contrat.montantRevise && Number(contrat.montantRevise) !== Number(contrat.montantInitial) && (
                  <p className="text-xs text-slate-500 mt-1">
                    Initial: {formatCurrency(Number(contrat.montantInitial))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline visuelle */}
          <div className="px-8 py-6">
            <div className="relative">
              {/* Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
              <div
                className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-600 transition-all duration-1000"
                style={{ width: contrat.dateDemarrage ? '50%' : '33%' }}
              />

              {/* Timeline items */}
              <div className="relative grid grid-cols-3 gap-4">
                {timelineDates.map((item, index) => {
                  const TimelineIcon = item.icon;
                  const isActive = item.completed;
                  const isLast = index === timelineDates.length - 1;

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg transition-all duration-500 border-4 border-white z-10',
                        isActive
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          : isLast && isOverdue
                            ? 'bg-gradient-to-br from-red-500 to-rose-600'
                            : 'bg-slate-200'
                      )}>
                        <TimelineIcon size={20} className={isActive || (isLast && isOverdue) ? 'text-white' : 'text-slate-400'} />
                      </div>
                      <div className="text-center">
                        <p className={cn(
                          'text-sm font-bold mb-1',
                          isActive ? 'text-slate-900' : 'text-slate-500'
                        )}>
                          {item.label}
                        </p>
                        {item.date && (
                          <p className={cn(
                            'text-xs',
                            isLast && isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'
                          )}>
                            {formatDate(item.date)}
                          </p>
                        )}
                        {!item.date && (
                          <p className="text-xs text-slate-400 italic">Non défini</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard KPI */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Taux d'exécution - Plus large */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full -translate-y-8 translate-x-8 opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Taux d'Exécution
                    </p>
                    <p className="text-4xl font-extrabold text-slate-900 tabular-nums">
                      {stats.tauxExecution}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={cn('h-full transition-all duration-500', getProgressColor(stats.tauxExecution))}
                    style={{ width: `${stats.tauxExecution}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Payé:</span>
                    <span className="ml-1 font-bold text-emerald-600">{formatCurrency(stats.montantPaye)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total:</span>
                    <span className="ml-1 font-bold text-slate-900">{formatCurrency(stats.montantTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Livrables */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3">
                <Package size={20} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-1 tabular-nums">
                {stats.livrablesReceptionnes} / {stats.nombreLivrables}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Livrables réceptionnés
              </p>
              <div className="mt-3 h-2 bg-blue-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500"
                  style={{ width: stats.nombreLivrables > 0 ? `${(stats.livrablesReceptionnes / stats.nombreLivrables) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Paiements */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3">
                <CreditCard size={20} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-1 tabular-nums">
                {stats.paiementsEffectues} / {stats.nombrePaiements}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paiements effectués
              </p>
              <div className="mt-3 h-2 bg-purple-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500"
                  style={{ width: stats.nombrePaiements > 0 ? `${(stats.paiementsEffectues / stats.nombrePaiements) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Avenants */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3">
                <FileEdit size={20} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-1 tabular-nums">
                {stats.nombreAvenants}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Avenants signés
              </p>
              {stats.nombreAvenants > 0 && contrat.montantRevise && (
                <p className="text-xs text-amber-600">
                  Impact: {formatCurrency(Number(contrat.montantRevise) - Number(contrat.montantInitial))}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab headers */}
          <div className="border-b border-slate-200 bg-slate-50/50">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('livrables')}
                className={cn(
                  'px-6 py-4 text-sm font-bold transition-all duration-200 border-b-2 relative',
                  activeTab === 'livrables'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span>Livrables</span>
                  {contrat.livrables && contrat.livrables.length > 0 && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-bold',
                      activeTab === 'livrables'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-600'
                    )}>
                      {contrat.livrables.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('paiements')}
                className={cn(
                  'px-6 py-4 text-sm font-bold transition-all duration-200 border-b-2 relative',
                  activeTab === 'paiements'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span>Paiements</span>
                  {contrat.paiements && contrat.paiements.length > 0 && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-bold',
                      activeTab === 'paiements'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-600'
                    )}>
                      {contrat.paiements.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('avenants')}
                className={cn(
                  'px-6 py-4 text-sm font-bold transition-all duration-200 border-b-2 relative',
                  activeTab === 'avenants'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                )}
              >
                <div className="flex items-center gap-2">
                  <FileEdit size={16} />
                  <span>Avenants</span>
                  {contrat.avenants && contrat.avenants.length > 0 && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-bold',
                      activeTab === 'avenants'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-600'
                    )}>
                      {contrat.avenants.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {/* Livrables Tab */}
            {activeTab === 'livrables' && (
              <div className="space-y-3">
                {contrat.livrables && contrat.livrables.length > 0 ? (
                  contrat.livrables.map((livrable: Livrable) => {
                    const statusConfig = LIVRABLE_STATUS_CONFIG[livrable.status] || LIVRABLE_STATUS_CONFIG.EN_ATTENTE;
                    const StatusIcon = statusConfig.icon;
                    const isOverdue = new Date(livrable.dateEcheance) < new Date() && livrable.status !== 'VALIDE';

                    return (
                      <div
                        key={livrable.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 mb-1">{livrable.titre}</h4>
                              {livrable.description && (
                                <p className="text-sm text-slate-600 line-clamp-2">{livrable.description}</p>
                              )}
                            </div>
                            <div className={cn(
                              'px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-4',
                              statusConfig.color
                            )}>
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>Échéance: {formatDate(livrable.dateEcheance)}</span>
                              {isOverdue && (
                                <span className="ml-2 text-red-600 font-semibold">(En retard)</span>
                              )}
                            </div>
                            {livrable.responsable && (
                              <div className="flex items-center gap-1">
                                <span>Responsable: {livrable.responsable.firstName} {livrable.responsable.lastName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Aucun livrable défini</p>
                    <p className="text-sm text-slate-400 mt-1">Les livrables du contrat apparaîtront ici</p>
                  </div>
                )}
              </div>
            )}

            {/* Paiements Tab */}
            {activeTab === 'paiements' && (
              <div className="space-y-3">
                {contrat.paiements && contrat.paiements.length > 0 ? (
                  contrat.paiements.map((paiement: PaiementContrat) => {
                    const statusConfig = PAIEMENT_STATUS_CONFIG[paiement.status] || PAIEMENT_STATUS_CONFIG.EN_ATTENTE;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={paiement.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <CreditCard size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-bold text-slate-900">{paiement.type}</h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                {paiement.dateEcheance && (
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>Échéance: {formatDate(paiement.dateEcheance)}</span>
                                  </div>
                                )}
                                {paiement.datePaiement && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-green-600" />
                                    <span>Payé le {formatDate(paiement.datePaiement)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={cn(
                              'px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5',
                              statusConfig.color
                            )}>
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3 mt-3">
                            <div className="px-3 py-2 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-500 mb-0.5">Montant brut</p>
                              <p className="text-sm font-bold text-slate-900 tabular-nums">
                                {formatCurrency(Number(paiement.montantBrut))}
                              </p>
                            </div>
                            <div className="px-3 py-2 bg-amber-50 rounded-lg">
                              <p className="text-xs text-amber-600 mb-0.5">Taxes</p>
                              <p className="text-sm font-bold text-amber-900 tabular-nums">
                                {formatCurrency(Number(paiement.taxes))}
                              </p>
                            </div>
                            {Number(paiement.penalites) > 0 && (
                              <div className="px-3 py-2 bg-red-50 rounded-lg">
                                <p className="text-xs text-red-600 mb-0.5">Pénalités</p>
                                <p className="text-sm font-bold text-red-900 tabular-nums">
                                  -{formatCurrency(Number(paiement.penalites))}
                                </p>
                              </div>
                            )}
                            <div className="px-3 py-2 bg-emerald-50 rounded-lg">
                              <p className="text-xs text-emerald-600 mb-0.5">Montant net</p>
                              <p className="text-sm font-bold text-emerald-900 tabular-nums">
                                {formatCurrency(Number(paiement.montantNet))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <CreditCard size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Aucun paiement enregistré</p>
                    <p className="text-sm text-slate-400 mt-1">Les paiements du contrat apparaîtront ici</p>
                  </div>
                )}
              </div>
            )}

            {/* Avenants Tab */}
            {activeTab === 'avenants' && (
              <div className="space-y-3">
                {contrat.avenants && contrat.avenants.length > 0 ? (
                  contrat.avenants.map((avenant: Avenant) => {
                    const impact = Number(avenant.montantImpact);
                    const isPositive = impact >= 0;

                    return (
                      <div
                        key={avenant.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                          <FileEdit size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-slate-900">Avenant N°{avenant.numero}</h4>
                                <span className="text-xs text-slate-500">
                                  Signé le {formatDate(avenant.dateSignature)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium mb-2">{avenant.objet}</p>
                              <p className="text-sm text-slate-600">{avenant.justification}</p>
                            </div>
                            <div className={cn(
                              'px-4 py-2 rounded-xl ml-4 shrink-0',
                              isPositive ? 'bg-red-50' : 'bg-green-50'
                            )}>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: isPositive ? '#dc2626' : '#059669' }}>
                                Impact budgétaire
                              </p>
                              <p className={cn(
                                'text-xl font-extrabold tabular-nums',
                                isPositive ? 'text-red-600' : 'text-green-600'
                              )}>
                                {isPositive ? '+' : ''}{formatCurrency(impact)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <FileEdit size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Aucun avenant</p>
                    <p className="text-sm text-slate-400 mt-1">Les avenants au contrat apparaîtront ici</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations contractuelles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Informations contractuelles</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Gestionnaire</span>
                <span className="text-sm font-bold text-slate-900">
                  {contrat.gestionnaireUser
                    ? `${contrat.gestionnaireUser.firstName} ${contrat.gestionnaireUser.lastName}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Devise</span>
                <span className="text-sm font-bold text-slate-900">{contrat.devise}</span>
              </div>
              {contrat.dateReceptionProv && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Réception provisoire</span>
                  <span className="text-sm font-bold text-slate-900">{formatDate(contrat.dateReceptionProv)}</span>
                </div>
              )}
              {contrat.dateReceptionDef && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Réception définitive</span>
                  <span className="text-sm font-bold text-slate-900">{formatDate(contrat.dateReceptionDef)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modalités financières */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Modalités financières</h3>
            <div className="space-y-3">
              {contrat.modalitesAvance && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Avance</p>
                  <p className="text-sm text-blue-900">{contrat.modalitesAvance}</p>
                </div>
              )}
              {contrat.modalitesAcompte && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Acompte</p>
                  <p className="text-sm text-purple-900">{contrat.modalitesAcompte}</p>
                </div>
              )}
              {contrat.modalitesRetenue && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Retenue de garantie</p>
                  <p className="text-sm text-amber-900">{contrat.modalitesRetenue}</p>
                </div>
              )}
              {contrat.garanties && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Garanties</p>
                  <p className="text-sm text-green-900">{contrat.garanties}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
