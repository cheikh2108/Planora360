'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { proceduresApi } from '@/lib/api';
import type { Procedure, StatusProcedure } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { CreateProcedureModal } from '@/components/passation/CreateProcedureModal';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import {
  FileText, Plus, Search, Filter, Gavel, Loader2
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: StatusProcedure | 'ALL' }[] = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Brouillon', value: 'BROUILLON' },
  { label: 'Publiée', value: 'PUBLIEE' },
  { label: 'En cours', value: 'EN_COURS' },
  { label: 'Clôturée', value: 'CLOTUREE_OFFRES' },
  { label: 'Évaluation', value: 'EVALUATION' },
  { label: 'Attribuée', value: 'ATTRIBUEE' },
  { label: 'Infructueuse', value: 'INFRUCTUEUSE' },
  { label: 'Annulée', value: 'ANNULEE' },
];

export default function ProceduresPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusProcedure | 'ALL'>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: procedures, isLoading } = useQuery({
    queryKey: ['procedures', selectedStatus],
    queryFn: async () => {
      const filters = selectedStatus !== 'ALL' ? { status: selectedStatus } : undefined;
      const res = await proceduresApi.getAll(filters);
      return (res.data || []) as Procedure[];
    },
  });

  const filteredProcedures = procedures?.filter((procedure) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      procedure.reference.toLowerCase().includes(query) ||
      procedure.objet.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: procedures?.length || 0,
    enCours: procedures?.filter((p) => p.status === 'EN_COURS').length || 0,
    evaluation: procedures?.filter((p) => p.status === 'EVALUATION').length || 0,
    attribuees: procedures?.filter((p) => p.status === 'ATTRIBUEE').length || 0,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Procédures de Passation"
        subtitle={`${stats.total} procédure${stats.total > 1 ? 's' : ''}`}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Nouvelle procédure
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* KPI Cards */}
        {!isLoading && procedures && procedures.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white', icon: Gavel },
              { label: 'En cours', value: stats.enCours, color: 'text-blue-600', bg: 'bg-blue-50', icon: Filter },
              { label: 'Évaluation', value: stats.evaluation, color: 'text-purple-600', bg: 'bg-purple-50', icon: Search },
              { label: 'Attribuées', value: stats.attribuees, color: 'text-green-600', bg: 'bg-green-50', icon: Plus },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={cn('rounded-2xl border border-slate-200 p-4 flex flex-col gap-2', stat.bg)}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <Icon size={14} className="text-slate-400" />
                  </div>
                  <p className={cn('text-2xl md:text-3xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
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

          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par référence ou objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            {/* Status Filters */}
            <div>
              <label className="block text-xs font-medium text-slate-900 mb-1.5">Statut</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedStatus(filter.value)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                      selectedStatus === filter.value
                        ? 'bg-[#0f1e38] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Liste des procédures</p>
            {filteredProcedures && filteredProcedures.length > 0 && (
              <span className="text-xs tabular-nums text-slate-400">{filteredProcedures.length}</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
            </div>
          ) : filteredProcedures && filteredProcedures.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Référence
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Objet
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                      Montant estimé
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Statut
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                      Soumissions
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                      Date publication
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcedures.map((procedure) => (
                    <tr
                      key={procedure.id}
                      onClick={() => router.push(`/passation/procedures/${procedure.id}`)}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#0f1e38]/10 flex items-center justify-center shrink-0">
                            <Gavel size={14} className="text-[#0f1e38]" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                            {procedure.reference}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-md">
                          <p className="truncate text-sm font-medium text-slate-900">{procedure.objet}</p>
                          {procedure.lignePPM && (
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              PPM: {procedure.lignePPM.reference}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right hidden sm:table-cell">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(Number(procedure.montantEstimatif || 0))}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <PassationStatusBadge status={procedure.status} />
                      </td>
                      <td className="px-4 py-4 text-center hidden md:table-cell">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {procedure._count?.soumissions || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 hidden lg:table-cell">
                        {formatDate(procedure.datePublication || procedure.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Gavel className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Aucune procédure</h3>
              <p className="mb-6 text-sm text-slate-600">
                {searchQuery
                  ? 'Aucune procédure ne correspond à votre recherche.'
                  : 'Commencez par créer votre première procédure.'}
              </p>
              {!searchQuery && (
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Nouvelle procédure
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <CreateProcedureModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(id) => router.push(`/passation/procedures/${id}`)}
      />
    </div>
  );
}
