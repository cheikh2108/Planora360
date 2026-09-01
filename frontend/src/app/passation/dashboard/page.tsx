'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  ppmApi,
  demandesApi,
  fournisseursApi,
  proceduresApi,
  contratsApi,
} from '@/lib/api';
import {
  FileText,
  ShoppingCart,
  Users,
  Gavel,
  FileSignature,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  // Fetch all data
  const { data: ppms, isLoading: isLoadingPPM } = useQuery({
    queryKey: ['dashboard-ppm'],
    queryFn: async () => {
      const res = await ppmApi.getAll({ year: new Date().getFullYear() });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: demandes, isLoading: isLoadingDemandes } = useQuery({
    queryKey: ['dashboard-demandes'],
    queryFn: async () => {
      const res = await demandesApi.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: fournisseurs, isLoading: isLoadingFournisseurs } = useQuery({
    queryKey: ['dashboard-fournisseurs'],
    queryFn: async () => {
      const res = await fournisseursApi.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: procedures, isLoading: isLoadingProcedures } = useQuery({
    queryKey: ['dashboard-procedures'],
    queryFn: async () => {
      const res = await proceduresApi.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: contrats, isLoading: isLoadingContrats } = useQuery({
    queryKey: ['dashboard-contrats'],
    queryFn: async () => {
      const res = await contratsApi.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const isLoading =
    isLoadingPPM ||
    isLoadingDemandes ||
    isLoadingFournisseurs ||
    isLoadingProcedures ||
    isLoadingContrats;

  // Calculate stats
  const stats = {
    ppm: {
      total: ppms?.length || 0,
      valides: ppms?.filter((p: any) => p.status === 'VALIDE').length || 0,
      enCours: ppms?.filter((p: any) => p.status === 'EN_COURS').length || 0,
    },
    demandes: {
      total: demandes?.length || 0,
      enValidation: demandes?.filter((d: any) => d.status.includes('VALIDATION')).length || 0,
      approuvees: demandes?.filter((d: any) => d.status === 'APPROUVEE').length || 0,
      rejetees: demandes?.filter((d: any) => d.status === 'REJETEE').length || 0,
    },
    fournisseurs: {
      total: fournisseurs?.length || 0,
      actifs: fournisseurs?.filter((f: any) => f.status === 'ACTIF').length || 0,
      suspendus: fournisseurs?.filter((f: any) => f.status === 'SUSPENDU').length || 0,
    },
    procedures: {
      total: procedures?.length || 0,
      enCours: procedures?.filter((p: any) => p.status === 'EN_COURS').length || 0,
      evaluation: procedures?.filter((p: any) => p.status === 'EVALUATION').length || 0,
      attribuees: procedures?.filter((p: any) => p.status === 'ATTRIBUEE').length || 0,
    },
    contrats: {
      total: contrats?.length || 0,
      enCours: contrats?.filter((c: any) => c.status === 'EN_COURS').length || 0,
      termines: contrats?.filter((c: any) => c.status === 'TERMINE').length || 0,
      montantTotal: contrats?.reduce(
        (sum: number, c: any) => sum + Number(c.montantRevise || c.montantInitial || 0),
        0
      ) || 0,
    },
  };

  const kpiCards = [
    {
      label: 'Plans PPM',
      value: stats.ppm.total,
      sublabel: `${stats.ppm.valides} validés`,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Demandes',
      value: stats.demandes.total,
      sublabel: `${stats.demandes.enValidation} en validation`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Fournisseurs',
      value: stats.fournisseurs.total,
      sublabel: `${stats.fournisseurs.actifs} actifs`,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Procédures',
      value: stats.procedures.total,
      sublabel: `${stats.procedures.enCours} en cours`,
      icon: Gavel,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: '+15%',
      trendUp: true,
    },
    {
      label: 'Contrats',
      value: stats.contrats.total,
      sublabel: `${stats.contrats.enCours} en exécution`,
      icon: FileSignature,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      trend: '+10%',
      trendUp: true,
    },
    {
      label: 'Montant Total',
      value: formatCurrency(stats.contrats.montantTotal),
      sublabel: 'Contrats actifs',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+22%',
      trendUp: true,
    },
  ];

  const statusCards = [
    {
      title: 'Demandes en Validation',
      value: stats.demandes.enValidation,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description: 'Nécessitent une action',
    },
    {
      title: 'Demandes Approuvées',
      value: stats.demandes.approuvees,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Prêtes pour procédures',
    },
    {
      title: 'Procédures en Évaluation',
      value: stats.procedures.evaluation,
      icon: AlertCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Offres à évaluer',
    },
    {
      title: 'Contrats Terminés',
      value: stats.contrats.termines,
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      description: 'Exécution complète',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Tableau de Bord"
          subtitle="Vue d'ensemble et indicateurs clés"
        />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Tableau de Bord"
        subtitle="Vue d'ensemble et indicateurs clés"
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className={cn('rounded-2xl border border-slate-200 p-5 bg-white')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {kpi.label}
                    </p>
                    <p className={cn('text-3xl font-bold tabular-nums mt-2', kpi.color)}>
                      {kpi.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{kpi.sublabel}</p>
                  </div>
                  <div className={cn('rounded-xl p-3', kpi.bg)}>
                    <Icon size={20} className={kpi.color} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {kpi.trendUp ? (
                    <TrendingUp size={14} className="text-green-600" />
                  ) : (
                    <TrendingDown size={14} className="text-red-600" />
                  )}
                  <span className={cn('text-xs font-medium', kpi.trendUp ? 'text-green-600' : 'text-red-600')}>
                    {kpi.trend}
                  </span>
                  <span className="text-xs text-slate-400">vs mois dernier</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="rounded-2xl border border-slate-200 p-5 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('rounded-lg p-2', card.bg)}>
                    <Icon size={16} className={card.color} />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">{card.title}</p>
                </div>
                <p className={cn('text-2xl font-bold tabular-nums', card.color)}>{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Procedures */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gavel size={16} className="text-slate-400" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Procédures Récentes
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {procedures?.slice(0, 5).map((proc: any) => (
                <div key={proc.id} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{proc.reference}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{proc.objet}</p>
                  </div>
                  <div className="ml-4">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide',
                      proc.status === 'EN_COURS' ? 'bg-blue-50 text-blue-700' :
                      proc.status === 'EVALUATION' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-50 text-slate-700'
                    )}>
                      {proc.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!procedures || procedures.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Aucune procédure récente</p>
              )}
            </div>
          </div>

          {/* Recent Contracts */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSignature size={16} className="text-slate-400" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Contrats Récents
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {contrats?.slice(0, 5).map((contrat: any) => (
                <div key={contrat.id} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{contrat.reference}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {contrat.fournisseur?.raisonSociale}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(Number(contrat.montantRevise || contrat.montantInitial))}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatDate(contrat.dateSignature)}
                    </p>
                  </div>
                </div>
              ))}
              {(!contrats || contrats.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Aucun contrat récent</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
