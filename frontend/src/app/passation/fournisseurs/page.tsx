'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { CreateFournisseurModal } from '@/components/passation/CreateFournisseurModal';
import { fournisseursApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Fournisseur, StatusFournisseur } from '@/lib/types-passation';
import { Plus, Search, Filter, Loader2, Building2 } from 'lucide-react';

const STATUS_FILTERS: { label: string; value: StatusFournisseur | 'ALL' }[] = [
  { label: 'Tous', value: 'ALL' },
  { label: 'À valider', value: 'A_VALIDER' },
  { label: 'Actif', value: 'ACTIF' },
  { label: 'Suspendu', value: 'SUSPENDU' },
  { label: 'Blacklisté', value: 'BLACKLISTE' },
  { label: 'Archivé', value: 'ARCHIVE' },
];

export default function FournisseursPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<StatusFournisseur | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: fournisseurs, isLoading } = useQuery({
    queryKey: ['fournisseurs', selectedStatus],
    queryFn: async () => {
      const filters = selectedStatus !== 'ALL' ? { status: selectedStatus } : undefined;
      const res = await fournisseursApi.getAll(filters);
      return (res.data || []) as Fournisseur[];
    },
  });

  const filteredFournisseurs = fournisseurs?.filter((fournisseur) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      fournisseur.raisonSociale.toLowerCase().includes(query) ||
      fournisseur.email?.toLowerCase().includes(query) ||
      fournisseur.identifiantFiscal?.toLowerCase().includes(query) ||
      fournisseur.registreCommerce?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: fournisseurs?.length || 0,
    actifs: fournisseurs?.filter((f) => f.status === 'ACTIF').length || 0,
    aValider: fournisseurs?.filter((f) => f.status === 'A_VALIDER').length || 0,
    suspendus: fournisseurs?.filter((f) => f.status === 'SUSPENDU').length || 0,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Fournisseurs"
        subtitle={`${stats.total} fournisseur${stats.total > 1 ? 's' : ''}`}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Nouveau fournisseur
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* KPI Cards */}
        {!isLoading && fournisseurs && fournisseurs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white', icon: Building2 },
              { label: 'Actifs', value: stats.actifs, color: 'text-green-600', bg: 'bg-green-50', icon: Plus },
              { label: 'À valider', value: stats.aValider, color: 'text-amber-600', bg: 'bg-amber-50', icon: Filter },
              { label: 'Suspendus', value: stats.suspendus, color: 'text-orange-600', bg: 'bg-orange-50', icon: Search },
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
                placeholder="Rechercher par raison sociale, email, référence..."
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
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Liste des fournisseurs</p>
            {filteredFournisseurs && filteredFournisseurs.length > 0 && (
              <span className="text-xs tabular-nums text-slate-400">{filteredFournisseurs.length}</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
            </div>
          ) : filteredFournisseurs && filteredFournisseurs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Référence
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Raison sociale
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Statut
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                      Soumissions
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                      Contrats
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFournisseurs.map((fournisseur) => (
                    <tr
                      key={fournisseur.id}
                      onClick={() => router.push(`/passation/fournisseurs/${fournisseur.id}`)}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#0f1e38]/10 flex items-center justify-center shrink-0">
                            <Building2 size={14} className="text-[#0f1e38]" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                            {fournisseur.raisonSociale}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {fournisseur.raisonSociale}
                          </p>
                          {fournisseur.ville && (
                            <p className="truncate text-xs text-slate-400">
                              {fournisseur.ville}
                              {fournisseur.pays && `, ${fournisseur.pays}`}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {fournisseur.email ? (
                          <div>
                            <p className="text-sm text-slate-900">{fournisseur.email}</p>
                            {fournisseur.telephone && (
                              <p className="text-xs text-slate-400">{fournisseur.telephone}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <PassationStatusBadge status={fournisseur.status} />
                      </td>
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {fournisseur._count?.soumissions || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden lg:table-cell">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {fournisseur._count?.contrats || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Aucun fournisseur</h3>
              <p className="mb-6 text-sm text-slate-600">
                {searchQuery
                  ? 'Aucun fournisseur ne correspond à votre recherche.'
                  : 'Commencez par ajouter votre premier fournisseur.'}
              </p>
              {!searchQuery && (
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Nouveau fournisseur
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <CreateFournisseurModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(id) => router.push(`/passation/fournisseurs/${id}`)}
      />
    </div>
  );
}
