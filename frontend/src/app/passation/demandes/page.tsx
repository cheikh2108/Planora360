'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { demandesApi } from '@/lib/api';
import type { DemandeAchat, StatusDemandeAchat } from '@/lib/types-passation';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';

const STATUS_FILTERS: { label: string; value: StatusDemandeAchat | 'ALL' }[] = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Brouillon', value: 'BROUILLON' },
  { label: 'Soumise', value: 'SOUMISE' },
  { label: 'Val. Hiérarchique', value: 'EN_VALIDATION_HIERARCHIQUE' },
  { label: 'Val. Technique', value: 'EN_VALIDATION_TECHNIQUE' },
  { label: 'Val. Administrative', value: 'EN_VALIDATION_ADMINISTRATIVE' },
  { label: 'Validée', value: 'VALIDEE' },
  { label: 'Rejetée', value: 'REJETEE' },
  { label: 'Annulée', value: 'ANNULEE' },
];

export default function DemandesAchatPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<StatusDemandeAchat | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: demandes, isLoading } = useQuery({
    queryKey: ['demandes', selectedStatus],
    queryFn: async () => {
      const filters = selectedStatus !== 'ALL' ? { status: selectedStatus } : undefined;
      const res = await demandesApi.getAll(filters);
      return (res.data || []) as DemandeAchat[];
    },
  });

  const filteredDemandes = demandes?.filter((demande) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      demande.reference.toLowerCase().includes(query) ||
      demande.objet.toLowerCase().includes(query) ||
      demande.demandeur?.firstName.toLowerCase().includes(query) ||
      demande.demandeur?.lastName.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num);
  };

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
        title="Demandes d'Achat"
        subtitle="Gestion des demandes d'achat et workflows de validation"
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => router.push('/passation/demandes/new')}
          >
            Nouvelle demande
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
              placeholder="Rechercher par référence, objet ou demandeur..."
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
            <p className="text-xs font-medium text-slate-600">Total demandes</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{demandes?.length || 0}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">En validation</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {demandes?.filter((d) => d.status.includes('VALIDATION')).length || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Validées</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {demandes?.filter((d) => d.status === 'VALIDEE').length || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-600">Rejetées</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {demandes?.filter((d) => d.status === 'REJETEE').length || 0}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredDemandes && filteredDemandes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Objet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Demandeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredDemandes.map((demande) => (
                    <tr
                      key={demande.id}
                      onClick={() => router.push(`/passation/demandes/${demande.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-blue-600">{demande.reference}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="truncate font-medium text-slate-900">{demande.objet}</p>
                          {demande.lignePpm && (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              PPM: {demande.lignePpm.reference}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(demande.montantEstime)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <PassationStatusBadge status={demande.status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {demande.demandeur?.firstName} {demande.demandeur?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{demande.demandeur?.email}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {formatDate(demande.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Aucune demande</h3>
              <p className="mb-6 text-sm text-slate-600">
                {searchQuery
                  ? 'Aucune demande ne correspond à votre recherche.'
                  : 'Commencez par créer votre première demande d\'achat.'}
              </p>
              {!searchQuery && (
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => router.push('/passation/demandes/new')}
                >
                  Nouvelle demande
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredDemandes && filteredDemandes.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Affichage de {filteredDemandes.length} demande{filteredDemandes.length > 1 ? 's' : ''}
            {demandes && filteredDemandes.length < demandes.length &&
              ` sur ${demandes.length} au total`}
          </div>
        )}
      </div>
    </div>
  );
}
