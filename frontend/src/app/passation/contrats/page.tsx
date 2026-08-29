'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { contratsApi, fournisseursApi } from '@/lib/api';
import { formatCurrency, formatDate, formatDateRelative, cn } from '@/lib/utils';
import type { Contrat, StatusContrat, Fournisseur } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Search, FileText, TrendingUp, DollarSign,
  Clock, CheckCircle2, AlertTriangle, XCircle,
  Calendar, Building2, ChevronRight, Activity
} from 'lucide-react';
import Link from 'next/link';

// Configuration des statuts avec couleurs custom et icônes
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

// Progress bar custom colors based on percentage
const getProgressColor = (rate: number): string => {
  if (rate >= 90) return 'bg-gradient-to-r from-emerald-500 to-green-600';
  if (rate >= 70) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
  if (rate >= 50) return 'bg-gradient-to-r from-amber-500 to-orange-600';
  if (rate >= 30) return 'bg-gradient-to-r from-orange-500 to-red-600';
  return 'bg-gradient-to-r from-red-500 to-rose-600';
};

const getProgressBg = (rate: number): string => {
  if (rate >= 90) return 'bg-emerald-50';
  if (rate >= 70) return 'bg-blue-50';
  if (rate >= 50) return 'bg-amber-50';
  if (rate >= 30) return 'bg-orange-50';
  return 'bg-red-50';
};

export default function ContratsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusContrat | 'ALL'>('ALL');
  const [fournisseurFilter, setFournisseurFilter] = useState<string>('ALL');

  // Fetch contrats
  const { data: contratsData, isLoading } = useQuery({
    queryKey: ['contrats', statusFilter, fournisseurFilter],
    queryFn: async () => {
      const filters: any = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (fournisseurFilter !== 'ALL') filters.fournisseurId = fournisseurFilter;
      const res = await contratsApi.getAll(filters);
      return (res.data || []) as Contrat[];
    },
  });

  // Fetch fournisseurs for filter
  const { data: fournisseursData } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      const res = await fournisseursApi.getAll();
      return (res.data || []) as Fournisseur[];
    },
  });

  const contrats = Array.isArray(contratsData) ? contratsData : [];
  const fournisseurs = Array.isArray(fournisseursData) ? fournisseursData : [];

  // Calculate execution rate
  const calculateExecutionRate = (contrat: Contrat): number => {
    const montantTotal = Number(contrat.montantRevise || contrat.montantInitial);
    const montantPaye = Number(contrat.montantPaye || 0);
    if (montantTotal === 0) return 0;
    return Math.round((montantPaye / montantTotal) * 100);
  };

  // Filter contrats by search query
  const filteredContrats = useMemo(() => {
    if (!searchQuery.trim()) return contrats;
    const query = searchQuery.toLowerCase();
    return contrats.filter(c =>
      c.reference.toLowerCase().includes(query) ||
      c.fournisseur?.raisonSociale.toLowerCase().includes(query) ||
      c.procedure?.objet.toLowerCase().includes(query)
    );
  }, [contrats, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = contrats.length;
    const enCours = contrats.filter(c => c.status === 'EN_COURS').length;
    const signes = contrats.filter(c => c.status === 'SIGNE').length;
    const termines = contrats.filter(c => c.status === 'TERMINE').length;
    const montantTotal = contrats.reduce(
      (sum, c) => sum + Number(c.montantRevise || c.montantInitial),
      0
    );
    const montantPaye = contrats.reduce((sum, c) => sum + Number(c.montantPaye || 0), 0);
    const tauxExecution = montantTotal > 0 ? Math.round((montantPaye / montantTotal) * 100) : 0;

    return { total, enCours, signes, termines, montantTotal, montantPaye, tauxExecution };
  }, [contrats]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
      <Header
        title="Contrats"
        subtitle={`${stats.total} contrat${stats.total > 1 ? 's' : ''} • ${stats.enCours} actif${stats.enCours > 1 ? 's' : ''}`}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => router.push('/passation/contrats/nouveau')}
          >
            Nouveau Contrat
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* Dashboard KPIs - Design asymétrique */}
        {!isLoading && contrats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Large Featured KPI - Taux d'exécution */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full -translate-y-12 translate-x-12 opacity-50" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Exécution Globale
                    </p>
                    <div className="flex items-baseline gap-3">
                      <p className="text-5xl font-extrabold text-slate-900 tracking-tight">
                        {stats.tauxExecution}%
                      </p>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg">
                        <TrendingUp size={14} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">
                          {formatCurrency(stats.montantPaye)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Activity size={28} className="text-white" />
                  </div>
                </div>

                {/* Custom Progress Bar */}
                <div className="mb-4">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-500', getProgressColor(stats.tauxExecution))}
                      style={{ width: `${stats.tauxExecution}%` }}
                    />
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Budget total</p>
                    <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                      {formatCurrency(stats.montantTotal)}
                    </p>
                  </div>
                  <div className="px-3 py-2 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-emerald-600 mb-1">Payé</p>
                    <p className="text-sm font-extrabold text-emerald-900 tabular-nums">
                      {formatCurrency(stats.montantPaye)}
                    </p>
                  </div>
                  <div className="px-3 py-2 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-600 mb-1">Restant</p>
                    <p className="text-sm font-extrabold text-amber-900 tabular-nums">
                      {formatCurrency(stats.montantTotal - stats.montantPaye)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smaller Status Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Activity size={20} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold mb-1">{stats.enCours}</p>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">En cours</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-cyan-200/50 hover:shadow-xl hover:shadow-cyan-300/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <FileText size={20} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold mb-1">{stats.signes}</p>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Signés</p>
              </div>

              <div className="col-span-2 bg-white rounded-2xl p-5 border border-green-100 shadow-sm shadow-green-100/50 hover:shadow-md hover:shadow-green-200/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 mb-1">{stats.termines}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Terminés</p>
                  </div>
                  {stats.termines > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Taux de succès</p>
                      <p className="text-2xl font-extrabold text-green-600 tabular-nums">
                        {Math.round((stats.termines / stats.total) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, fournisseur ou objet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                Statut
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  Tous
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key as StatusContrat)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200',
                        statusFilter === key
                          ? `${config.bg} ${config.color} border ${config.border} shadow-md`
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <Icon size={12} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fournisseur Filter */}
            {fournisseurs.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  Fournisseur
                </label>
                <select
                  value={fournisseurFilter}
                  onChange={(e) => setFournisseurFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                >
                  <option value="ALL">Tous les fournisseurs</option>
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.raisonSociale}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Liste des contrats - Cards interactives */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))
          ) : filteredContrats.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={searchQuery ? "Aucun contrat trouvé" : "Aucun contrat"}
              description={searchQuery
                ? "Essayez une autre recherche ou modifiez vos filtres"
                : "Créez votre premier contrat pour commencer"
              }
            />
          ) : (
            filteredContrats.map((contrat) => {
              const statusConfig = STATUS_CONFIG[contrat.status];
              const StatusIcon = statusConfig.icon;
              const executionRate = calculateExecutionRate(contrat);
              const montantTotal = Number(contrat.montantRevise || contrat.montantInitial);
              const isOverdue = new Date(contrat.dateEcheance) < new Date() && contrat.status === 'EN_COURS';

              return (
                <Link
                  key={contrat.id}
                  href={`/passation/contrats/${contrat.id}`}
                  className="block group"
                >
                  <div className={cn(
                    'bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300',
                    'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 hover:border-slate-300'
                  )}>
                    {/* Header */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn(
                            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                            statusConfig.gradient
                          )}>
                            <FileText size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                                {contrat.reference}
                              </h3>
                              {isOverdue && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                                  <Clock size={10} />
                                  En retard
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Building2 size={12} />
                              <span className="font-medium">{contrat.fournisseur?.raisonSociale || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'px-3 py-2 rounded-xl flex items-center gap-2 border',
                            statusConfig.bg,
                            statusConfig.color,
                            statusConfig.border
                          )}>
                            <StatusIcon size={14} />
                            <span className="text-xs font-bold">{statusConfig.label}</span>
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                      {/* Objet */}
                      {contrat.procedure?.objet && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {contrat.procedure.objet}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Exécution
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                            {executionRate}%
                          </span>
                        </div>
                        <div className={cn('h-2.5 rounded-full overflow-hidden', getProgressBg(executionRate))}>
                          <div
                            className={cn('h-full transition-all duration-500 shadow-sm', getProgressColor(executionRate))}
                            style={{ width: `${executionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="px-3 py-2 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Montant initial</p>
                          <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                            {formatCurrency(Number(contrat.montantInitial))}
                          </p>
                        </div>

                        {contrat.montantRevise && Number(contrat.montantRevise) !== Number(contrat.montantInitial) && (
                          <div className="px-3 py-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1">Montant révisé</p>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-extrabold text-blue-900 tabular-nums">
                                {formatCurrency(Number(contrat.montantRevise))}
                              </p>
                            </div>
                            {contrat._count?.avenants && contrat._count.avenants > 0 && (
                              <p className="text-xs text-blue-600 mt-0.5">
                                {contrat._count.avenants} avenant{contrat._count.avenants > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="px-3 py-2 bg-emerald-50 rounded-lg">
                          <p className="text-xs text-emerald-600 mb-1">Montant payé</p>
                          <p className="text-sm font-extrabold text-emerald-900 tabular-nums">
                            {formatCurrency(Number(contrat.montantPaye || 0))}
                          </p>
                        </div>

                        <div className="px-3 py-2 bg-amber-50 rounded-lg">
                          <p className="text-xs text-amber-600 mb-1">Restant</p>
                          <p className="text-sm font-extrabold text-amber-900 tabular-nums">
                            {formatCurrency(montantTotal - Number(contrat.montantPaye || 0))}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar size={12} />
                          <span>Signé {formatDate(contrat.dateSignature)}</span>
                        </div>
                        <div className={cn(
                          'flex items-center gap-1.5 font-semibold',
                          isOverdue ? 'text-red-600' : 'text-slate-600'
                        )}>
                          <Clock size={12} />
                          <span>Échéance {formatDateRelative(contrat.dateEcheance)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
