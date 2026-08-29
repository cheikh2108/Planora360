'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { fournisseursApi } from '@/lib/api';
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
      fournisseur.reference.toLowerCase().includes(query) ||
      fournisseur.identifiantFiscal?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Fournisseurs"
        subtitle="Gestion de la base des fournisseurs et prestataires"
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => router.push('/passation/fournisseurs/new')}
          >
            Nouveau fournisseur
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par raison sociale, email, référence ou identifiant fiscal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 shrink-0 text-slate-500" />
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Total fournisseurs</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{fournisseurs?.length || 0}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Actifs</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {fournisseurs?.filter((f) => f.status === 'ACTIF').length || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">À valider</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {fournisseurs?.filter((f) => f.status === 'A_VALIDER').length || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Suspendus</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              {fournisseurs?.filter((f) => f.status === 'SUSPENDU').length || 0}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredFournisseurs && filteredFournisseurs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Raison sociale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Soumissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Contrats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Création
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredFournisseurs.map((fournisseur) => (
                    <tr
                      key={fournisseur.id}
                      onClick={() => router.push(`/passation/fournisseurs/${fournisseur.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-blue-600">{fournisseur.reference}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {fournisseur.raisonSociale}
                            </p>
                            {fournisseur.ville && (
                              <p className="truncate text-xs text-slate-500">
                                {fournisseur.ville}
                                {fournisseur.pays && `, ${fournisseur.pays}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {fournisseur.email ? (
                          <div>
                            <p className="text-sm text-slate-900">{fournisseur.email}</p>
                            {fournisseur.telephone && (
                              <p className="text-xs text-slate-500">{fournisseur.telephone}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Non renseigné</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <PassationStatusBadge status={fournisseur.status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-semibold text-slate-900">
                            {fournisseur._count?.soumissions || 0}
                          </span>
                          <span className="text-xs text-slate-500">soumissions</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-semibold text-slate-900">
                            {fournisseur._count?.contrats || 0}
                          </span>
                          <span className="text-xs text-slate-500">contrats</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {formatDate(fournisseur.createdAt)}
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
                  onClick={() => router.push('/passation/fournisseurs/new')}
                >
                  Nouveau fournisseur
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredFournisseurs && filteredFournisseurs.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Affichage de {filteredFournisseurs.length} fournisseur
            {filteredFournisseurs.length > 1 ? 's' : ''}
            {fournisseurs && filteredFournisseurs.length < fournisseurs.length &&
              ` sur ${fournisseurs.length} au total`}
          </div>
        )}
      </div>
    </div>
  );
}
