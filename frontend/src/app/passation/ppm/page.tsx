'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ppmApi, plansApi } from '@/lib/api';
import type { PlanPassationMarche, StatusPPM } from '@/lib/types-passation';
import type { ActionPlan } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { CreatePPMModal } from '@/components/passation/CreatePPMModal';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { FileText, Plus, Filter, Calendar, DollarSign, ChevronRight, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

const STATUS_FILTERS: { value: StatusPPM | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'VALIDE', label: 'Validé' },
  { value: 'CLOTURE', label: 'Clôturé' },
];

// Années disponibles (dernières 5 années + 2 prochaines)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i);

export default function PPMListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusPPM | 'ALL'>('ALL');
  const [yearFilter, setYearFilter] = useState<number | 'ALL'>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch PPM list
  const { data: ppmData, isLoading } = useQuery({
    queryKey: ['ppm', statusFilter, yearFilter, projectFilter],
    queryFn: async () => {
      const filters: { year?: number; status?: string; projectId?: string } = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (yearFilter !== 'ALL') filters.year = yearFilter;
      if (projectFilter !== 'ALL') filters.projectId = projectFilter;

      const res = await ppmApi.getAll(filters);
      return res.data as PlanPassationMarche[];
    },
  });

  // Fetch projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ['plans-for-ppm-filter'],
    queryFn: async () => {
      const res = await plansApi.list({ limit: 100 });
      const result = res.data as { data: ActionPlan[] };
      return Array.isArray(result.data) ? result.data : [];
    },
  });

  const ppmList = Array.isArray(ppmData) ? ppmData : [];
  const projects = Array.isArray(projectsData) ? projectsData : [];

  // Stats for KPI cards
  const stats = useMemo(() => {
    const total = ppmList.length;
    const valides = ppmList.filter(p => p.status === 'VALIDE').length;
    const enCours = ppmList.filter(p => p.status === 'EN_COURS').length;
    const montantTotal = ppmList.reduce((sum, p) => sum + Number(p.montantTotal || 0), 0);

    return { total, valides, enCours, montantTotal };
  }, [ppmList]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Plans de Passation des Marchés (PPM)"
        subtitle={`${stats.total} plan${stats.total > 1 ? 's' : ''}`}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Nouveau PPM
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* KPI Cards */}
        {!isLoading && ppmList.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total PPM', value: stats.total, color: 'text-slate-900', bg: 'bg-white', icon: FileSpreadsheet },
              { label: 'Validés', value: stats.valides, color: 'text-green-600', bg: 'bg-green-50', icon: FileText },
              { label: 'En cours', value: stats.enCours, color: 'text-blue-600', bg: 'bg-blue-50', icon: Calendar },
              { label: 'Montant total', value: formatCurrency(stats.montantTotal), color: 'text-teal-600', bg: 'bg-teal-50', icon: DollarSign },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={cn('rounded-2xl border border-slate-200 p-4 flex flex-col gap-2', stat.bg)}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <Icon size={14} className="text-slate-400" />
                  </div>
                  <p className={cn('text-2xl md:text-3xl font-bold tabular-nums', stat.color)}>
                    {typeof stat.value === 'number' ? stat.value : stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-slate-400" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Filtres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-900 mb-1.5">Statut</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                      statusFilter === f.value
                        ? 'bg-[#0f1e38] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-900 mb-1.5">Année</label>
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-white"
              >
                <option value="ALL">Toutes les années</option>
                {YEAR_OPTIONS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-900 mb-1.5">Projet</label>
              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-white"
              >
                <option value="ALL">Tous les projets</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Liste des PPM</p>
            {ppmList.length > 0 && (
              <span className="text-xs tabular-nums text-slate-400">{ppmList.length}</span>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : ppmList.length === 0 ? (
            <EmptyState
              illustration="data"
              title="Aucun PPM"
              description="Créez votre premier Plan de Passation des Marchés pour planifier vos achats."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Référence
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                      Année
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                      Projet
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                      Montant Total
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                      Lignes
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Statut
                    </th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {ppmList.map(ppm => (
                    <tr
                      key={ppm.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <Link href={`/passation/ppm/${ppm.id}`} className="block">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#0f1e38]/10 flex items-center justify-center shrink-0">
                              <FileText size={14} className="text-[#0f1e38]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                                {ppm.reference}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatDate(ppm.createdAt)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm font-medium text-slate-700">{ppm.year}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        {ppm.project ? (
                          <span className="text-sm text-slate-600 truncate max-w-xs block">
                            {ppm.project.title}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right hidden sm:table-cell">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(Number(ppm.montantTotal || 0))}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
                          <FileSpreadsheet size={12} />
                          {ppm.nombreLignes} ligne{ppm.nombreLignes > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <PassationStatusBadge status={ppm.status} />
                      </td>
                      <td className="px-3">
                        <Link href={`/passation/ppm/${ppm.id}`}>
                          <ChevronRight
                            size={16}
                            className="text-slate-300 group-hover:text-[#2563eb] transition-colors"
                          />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <CreatePPMModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(id) => router.push(`/passation/ppm/${id}`)}
      />
    </div>
  );
}
