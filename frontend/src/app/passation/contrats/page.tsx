'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { contratsApi } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Contrat, StatusContrat } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { CreateContratModal } from '@/components/passation/CreateContratModal';
import {
  Plus, Search, Filter, FileText, Loader2, Activity, DollarSign
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: StatusContrat | 'ALL' }[] = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Signé', value: 'SIGNE' },
  { label: 'En cours', value: 'EN_COURS' },
  { label: 'Suspendu', value: 'SUSPENDU' },
  { label: 'Terminé', value: 'TERMINE' },
  { label: 'Clôturé', value: 'CLOTURE' },
  { label: 'Résilié', value: 'RESILIE' },
];

export default function ContratsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusContrat | 'ALL'>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: contrats, isLoading } = useQuery({
    queryKey: ['contrats', selectedStatus],
    queryFn: async () => {
      const filters = selectedStatus !== 'ALL' ? { status: selectedStatus } : undefined;
      const res = await contratsApi.getAll(filters);
      return (res.data || []) as Contrat[];
    },
  });

  const filteredContrats = contrats?.filter((contrat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contrat.reference.toLowerCase().includes(query) ||
      contrat.fournisseur?.raisonSociale.toLowerCase().includes(query) ||
      contrat.procedure?.objet.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: contrats?.length || 0,
    enCours: contrats?.filter((c) => c.status === 'EN_COURS').length || 0,
    signes: contrats?.filter((c) => c.status === 'SIGNE').length || 0,
    termines: contrats?.filter((c) => c.status === 'TERMINE').length || 0,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Contrats"
        subtitle={`${stats.total} contrat${stats.total > 1 ? 's' : ''}`}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Nouveau contrat
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* KPI Cards */}
        {!isLoading && contrats && contrats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white', icon: FileText },
              { label: 'Signés', value: stats.signes, color: 'text-blue-600', bg: 'bg-blue-50', icon: Filter },
              { label: 'En cours', value: stats.enCours, color: 'text-green-600', bg: 'bg-green-50', icon: Activity },
              { label: 'Terminés', value: stats.termines, color: 'text-teal-600', bg: 'bg-teal-50', icon: DollarSign },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={cn('rounded-2xl border border-slate-200 p-4 flex flex-col gap-2', stat.bg)}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{stat.label}</p>
                    <Icon size={14} className="text-slate-600" />
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
            <Filter size={14} className="text-slate-600" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Filtres</p>
          </div>

          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                placeholder="Rechercher par référence, fournisseur ou objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-600 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Liste des contrats</p>
            {filteredContrats && filteredContrats.length > 0 && (
              <span className="text-xs tabular-nums text-slate-600">{filteredContrats.length}</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
            </div>
          ) : filteredContrats && filteredContrats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Référence
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Fournisseur
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hidden sm:table-cell">
                      Montant
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Statut
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hidden md:table-cell">
                      Date signature
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hidden lg:table-cell">
                      Échéance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContrats.map((contrat) => (
                    <tr
                      key={contrat.id}
                      onClick={() => router.push(`/passation/contrats/${contrat.id}`)}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#0f1e38]/10 flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-[#0f1e38]" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                            {contrat.reference}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-md">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {contrat.fournisseur?.raisonSociale}
                          </p>
                          {contrat.procedure && (
                            <p className="mt-0.5 truncate text-xs text-slate-600">
                              {contrat.procedure.objet}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right hidden sm:table-cell">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(Number(contrat.montantRevise || contrat.montantInitial))}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <PassationStatusBadge status={contrat.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 hidden md:table-cell">
                        {formatDate(contrat.dateSignature)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 hidden lg:table-cell">
                        {formatDate(contrat.dateEcheance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Aucun contrat</h3>
              <p className="mb-6 text-sm text-slate-600">
                {searchQuery
                  ? 'Aucun contrat ne correspond à votre recherche.'
                  : 'Commencez par créer votre premier contrat.'}
              </p>
              {!searchQuery && (
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Nouveau contrat
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <CreateContratModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(id) => router.push(`/passation/contrats/${id}`)}
      />
    </div>
  );
}
