'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { proceduresApi } from '@/lib/api';
import type { Procedure, MethodeProcedure, StatusProcedure } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency, formatDateRelative, cn } from '@/lib/utils';
import {
  FileText, Plus, Search, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Archive, ChevronRight,
  Gavel, Users, Calendar
} from 'lucide-react';
import Link from 'next/link';

// Configuration des méthodes avec couleurs custom et gradients
const METHODE_CONFIG: Record<MethodeProcedure, {
  label: string;
  color: string;
  gradient: string;
  icon: string;
}> = {
  APPEL_OFFRES_OUVERT: {
    label: 'AO Ouvert',
    color: 'from-emerald-500 to-teal-600',
    gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    icon: '📢'
  },
  APPEL_OFFRES_RESTREINT: {
    label: 'AO Restreint',
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

// Status avec couleurs custom (pas de blue-600 générique)
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
    icon: Archive
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
    icon: AlertCircle
  },
};

export default function ProceduresPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusProcedure | 'ALL'>('ALL');
  const [methodeFilter, setMethodeFilter] = useState<MethodeProcedure | 'ALL'>('ALL');

  const { data: proceduresData, isLoading } = useQuery({
    queryKey: ['procedures', statusFilter, methodeFilter],
    queryFn: async () => {
      const filters: { status?: string; methode?: string } = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (methodeFilter !== 'ALL') filters.methode = methodeFilter;

      const res = await proceduresApi.getAll(filters);
      return res.data as Procedure[];
    },
  });

  const procedures = Array.isArray(proceduresData) ? proceduresData : [];

  // Filtrage par recherche
  const filteredProcedures = useMemo(() => {
    if (!searchQuery.trim()) return procedures;
    const query = searchQuery.toLowerCase();
    return procedures.filter(p =>
      p.reference.toLowerCase().includes(query) ||
      p.objet.toLowerCase().includes(query)
    );
  }, [procedures, searchQuery]);

  // Stats pour KPIs
  const stats = useMemo(() => {
    const total = procedures.length;
    const enCours = procedures.filter(p => p.status === 'EN_COURS').length;
    const evaluation = procedures.filter(p => p.status === 'EVALUATION').length;
    const attribuees = procedures.filter(p => p.status === 'ATTRIBUEE').length;
    const montantTotal = procedures.reduce((sum, p) => sum + Number(p.montantEstime || 0), 0);

    return { total, enCours, evaluation, attribuees, montantTotal };
  }, [procedures]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
      <Header
        title="Procédures de Passation"
        subtitle={`${stats.total} procédure${stats.total > 1 ? 's' : ''} • ${formatCurrency(stats.montantTotal)} estimés`}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => router.push('/passation/procedures/nouveau')}
          >
            Nouvelle Procédure
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* KPIs - Layout asymétrique intentionnel */}
        {!isLoading && procedures.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Large card - Span 2 columns */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-slate-900/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              <div className="relative">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Montant Total Estimé
                    </p>
                    <p className="text-4xl font-extrabold tracking-tight">
                      {formatCurrency(stats.montantTotal)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp size={24} className="text-emerald-400" />
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-slate-400">Procédures</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.attribuees}</p>
                    <p className="text-xs text-slate-400">Attribuées</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smaller cards - Asymmetric */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm shadow-indigo-100/50 hover:shadow-md hover:shadow-indigo-200/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Clock size={18} className="text-white" />
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  ACTIF
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{stats.enCours}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En cours</p>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-purple-100 shadow-sm shadow-purple-100/50 hover:shadow-md hover:shadow-purple-200/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3">
                    <Users size={18} className="text-white" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{stats.evaluation}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En évaluation</p>
                </div>
                {stats.evaluation > 0 && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-purple-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                      <span className="text-xs font-bold">PRIORITÉ</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {/* Recherche */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par référence ou objet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre Statut */}
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
                      onClick={() => setStatusFilter(key as StatusProcedure)}
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

            {/* Filtre Méthode */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                Méthode
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMethodeFilter('ALL')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                    methodeFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  Toutes
                </button>
                {Object.entries(METHODE_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setMethodeFilter(key as MethodeProcedure)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200',
                      methodeFilter === key
                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <span>{config.icon}</span>
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Liste des procédures - Cards asymétriques */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))
          ) : filteredProcedures.length === 0 ? (
            <EmptyState
              icon={Gavel}
              title={searchQuery ? "Aucune procédure trouvée" : "Aucune procédure"}
              description={searchQuery
                ? "Essayez une autre recherche ou modifiez vos filtres"
                : "Créez votre première procédure de passation de marché"
              }
            />
          ) : (
            filteredProcedures.map((procedure, idx) => {
              const statusConfig = STATUS_CONFIG[procedure.status];
              const methodeConfig = METHODE_CONFIG[procedure.methode];
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={procedure.id}
                  href={`/passation/procedures/${procedure.id}`}
                  className="block group"
                >
                  <div className={cn(
                    'bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1',
                    'hover:border-slate-300'
                  )}>
                    {/* Header avec gradient */}
                    <div className={cn(
                      'px-6 py-4 bg-gradient-to-r',
                      methodeConfig.color,
                      'text-white'
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{methodeConfig.icon}</span>
                            <div>
                              <h3 className="text-xl font-bold tracking-tight group-hover:tracking-wide transition-all duration-300">
                                {procedure.reference}
                              </h3>
                              <p className="text-sm font-medium text-white/80">
                                {methodeConfig.label}
                              </p>
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          size={24}
                          className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">
                            {procedure.objet}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} />
                              <span>Publié {formatDate(procedure.datePublication || procedure.createdAt)}</span>
                            </div>
                            {procedure.dateLimite && (
                              <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                                <Clock size={12} />
                                <span>Limite {formatDateRelative(procedure.dateLimite)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={cn(
                          'px-3 py-2 rounded-xl flex items-center gap-2 border',
                          statusConfig.bg,
                          statusConfig.color,
                          statusConfig.border
                        )}>
                          <StatusIcon size={14} />
                          <span className="text-xs font-bold">{statusConfig.label}</span>
                        </div>
                      </div>

                      {/* Footer avec métriques */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="px-3 py-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 mb-0.5">Montant estimé</p>
                            <p className="text-base font-extrabold text-slate-900 tabular-nums">
                              {formatCurrency(Number(procedure.montantEstime || 0))}
                            </p>
                          </div>
                          {procedure._count?.soumissions !== undefined && (
                            <div className="px-3 py-2 bg-indigo-50 rounded-lg">
                              <p className="text-xs text-indigo-600 mb-0.5">Soumissions</p>
                              <p className="text-base font-extrabold text-indigo-900 tabular-nums">
                                {procedure._count.soumissions}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-slate-400 group-hover:text-slate-900 transition-colors duration-300">
                          <span className="text-xs font-bold uppercase tracking-wider">Voir détails</span>
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
