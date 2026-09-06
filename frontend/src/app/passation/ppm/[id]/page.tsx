'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ppmApi } from '@/lib/api';
import type { PlanPassationMarche, LignePPM } from '@/lib/types-passation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { AddLignePPMModal } from '@/components/passation/AddLignePPMModal';
import { EditPPMModal } from '@/components/passation/EditPPMModal';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  User,
  ShoppingCart,
  ClipboardList,
  Download,
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
} from 'lucide-react';
import Link from 'next/link';

const METHODE_LABELS: Record<string, string> = {
  APPEL_OFFRES_OUVERT: 'Appel d\'offres ouvert',
  APPEL_OFFRES_RESTREINT: 'Appel d\'offres restreint',
  CONSULTATION: 'Consultation',
  GRE_A_GRE: 'Gré à gré',
};

const TRIMESTRE_LABELS: Record<number, string> = {
  1: 'T1',
  2: 'T2',
  3: 'T3',
  4: 'T4',
};

export default function PPMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success: successToast, error: errorToast } = useToast();
  const ppmId = params?.id as string;
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'excel' | null>(null);
  const [addLigneModalOpen, setAddLigneModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Fetch PPM details
  const { data: ppmData, isLoading, error } = useQuery({
    queryKey: ['ppm', ppmId],
    queryFn: async () => {
      const res = await ppmApi.getOne(ppmId);
      return res.data as PlanPassationMarche;
    },
    enabled: !!ppmId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => ppmApi.remove(ppmId),
    onSuccess: () => {
      successToast('PPM supprimé avec succès');
      router.push('/passation/ppm');
    },
    onError: (err: any) => {
      errorToast(err.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  // Change status mutation
  const changeStatusMutation = useMutation({
    mutationFn: (newStatus: string) => ppmApi.updateStatus(ppmId, newStatus),
    onSuccess: () => {
      successToast('Statut modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['ppm', ppmId] });
      queryClient.invalidateQueries({ queryKey: ['ppm'] });
      setStatusMenuOpen(false);
    },
    onError: (err: any) => {
      errorToast(err.response?.data?.message || 'Erreur lors du changement de statut');
    },
  });

  // Validate PPM mutation
  const validateMutation = useMutation({
    mutationFn: () => ppmApi.validate(ppmId),
    onSuccess: () => {
      successToast('PPM validé avec succès');
      queryClient.invalidateQueries({ queryKey: ['ppm', ppmId] });
      queryClient.invalidateQueries({ queryKey: ['ppm'] });
    },
    onError: (err: any) => {
      errorToast(err.response?.data?.message || 'Erreur lors de la validation');
    },
  });

  // Export handlers
  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportingFormat(format);
      const res = await ppmApi.export(ppmId, format);

      // Create download link
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PPM_${ppmData?.reference}_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportingFormat(null);
    }
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce PPM ? Cette action est irréversible.')) {
      deleteMutation.mutate();
    }
  };

  const ppm = ppmData;
  const lignes = Array.isArray(ppm?.lignes) ? ppm.lignes : [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <FileText className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Erreur de chargement</h2>
          <p className="text-sm text-slate-500">Impossible de charger ce PPM.</p>
          <Button onClick={() => router.push('/passation/ppm')}>
            <ArrowLeft size={16} className="mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title={isLoading ? 'Chargement...' : ppm?.reference || 'PPM'}
        subtitle={isLoading ? '' : `Plan de Passation des Marchés ${ppm?.year}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/passation/ppm">
              <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} className="hidden md:flex">
                Retour
              </Button>
              <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} className="md:hidden" />
            </Link>

            {ppm?.status === 'BROUILLON' && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Edit2 size={14} />}
                  onClick={() => setEditModalOpen(true)}
                  className="hidden md:flex"
                >
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Edit2 size={14} />}
                  onClick={() => setEditModalOpen(true)}
                  className="md:hidden"
                />
              </>
            )}

            {ppm?.status === 'BROUILLON' && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Plus size={14} />}
                  onClick={() => setAddLigneModalOpen(true)}
                  className="hidden md:flex"
                >
                  Ajouter ligne
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Plus size={14} />}
                  onClick={() => setAddLigneModalOpen(true)}
                  className="md:hidden"
                />
                <Button
                  size="sm"
                  icon={<CheckCircle2 size={14} />}
                  onClick={() => validateMutation.mutate()}
                  disabled={validateMutation.isPending}
                  className="hidden md:flex"
                >
                  {validateMutation.isPending ? 'Validation...' : 'Valider'}
                </Button>
                <Button
                  size="sm"
                  icon={<CheckCircle2 size={14} />}
                  onClick={() => validateMutation.mutate()}
                  disabled={validateMutation.isPending}
                  className="md:hidden"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Trash2 size={14} />}
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:bg-red-50 md:hidden"
                />
              </>
            )}

            {/* Menu statut */}
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                icon={<MoreVertical size={14} />}
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="hidden md:flex"
              >
                Statut
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<MoreVertical size={14} />}
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="md:hidden"
              />

              {statusMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setStatusMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    {['BROUILLON', 'EN_COURS', 'VALIDE', 'CLOTURE'].map((status) => (
                      <button
                        key={status}
                        onClick={() => changeStatusMutation.mutate(status)}
                        disabled={ppm?.status === status}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors',
                          ppm?.status === status ? 'bg-slate-100 font-semibold cursor-default' : ''
                        )}
                      >
                        <PassationStatusBadge status={status as any} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {isLoading ? (
          <div className="space-y-5">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        ) : (
          <>
            {/* PPM Details Section */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Détails du PPM
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FileDown size={14} />}
                    onClick={() => handleExport('pdf')}
                    disabled={exportingFormat === 'pdf'}
                  >
                    {exportingFormat === 'pdf' ? 'Export...' : 'PDF'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={() => handleExport('excel')}
                    disabled={exportingFormat === 'excel'}
                  >
                    {exportingFormat === 'excel' ? 'Export...' : 'Excel'}
                  </Button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                {/* Status & Main Info */}
                <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                  <div className="space-y-3 w-full md:w-auto">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold text-slate-600 mb-1">
                        Référence
                      </p>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900">{ppm?.reference}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <PassationStatusBadge status={ppm?.status || 'BROUILLON'} />
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-xs uppercase tracking-widest font-semibold text-slate-600">
                      Montant Total
                    </p>
                    <p className="text-3xl font-bold text-teal-600 tabular-nums">
                      {formatCurrency(Number(ppm?.montantTotal || 0))}
                    </p>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {/* Year */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-600 mb-1">
                        Année
                      </p>
                      <p className="text-lg font-semibold text-slate-900">{ppm?.year}</p>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-600 mb-1">
                        Projet
                      </p>
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {ppm?.project?.title || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Lines Count */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <ClipboardList size={18} className="text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-600 mb-1">
                        Nombre de lignes
                      </p>
                      <p className="text-lg font-semibold text-slate-900">{ppm?.nombreLignes || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Validation Info (if validated) */}
                {ppm?.validatedAt && ppm?.validatedBy && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          Validé le {formatDate(ppm.validatedAt)}
                        </p>
                        <p className="text-xs text-green-700">
                          Par validateur ID: {ppm.validatedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="mt-6 flex items-center justify-between text-xs text-slate-600">
                  <span>Créé le {formatDate(ppm?.createdAt || '')}</span>
                  <span>Modifié le {formatDate(ppm?.updatedAt || '')}</span>
                </div>
              </div>
            </div>

            {/* Lignes PPM Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Lignes du PPM
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {lignes.length} marché{lignes.length > 1 ? 's' : ''} planifié{lignes.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {lignes.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                      <ShoppingCart size={12} />
                      {lignes.length}
                    </span>
                  )}
                  {ppm?.status === 'BROUILLON' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Plus size={14} />}
                      onClick={() => setAddLigneModalOpen(true)}
                    >
                      Ajouter
                    </Button>
                  )}
                </div>
              </div>

              {lignes.length === 0 ? (
                <div className="p-6 md:p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="text-slate-600" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune ligne</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Ce PPM ne contient pas encore de lignes de marché.
                  </p>
                  {ppm?.status === 'BROUILLON' && (
                    <Button
                      icon={<Plus size={16} />}
                      onClick={() => setAddLigneModalOpen(true)}
                    >
                      Ajouter la première ligne
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 whitespace-nowrap">
                          Référence
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 min-w-[200px]">
                          Objet du Marché
                        </th>
                        <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 whitespace-nowrap">
                          Montant Estimé
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 whitespace-nowrap">
                          Méthode
                        </th>
                        <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 whitespace-nowrap">
                          Trimestre
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 whitespace-nowrap">
                          Responsable
                        </th>
                        <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 whitespace-nowrap">
                          Activité
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignes.map((ligne: any, idx: number) => (
                        <tr
                          key={ligne.id}
                          className={cn(
                            'border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors',
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          )}
                        >
                          {/* Reference */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#0f1e38]/10 flex items-center justify-center shrink-0">
                                <FileText size={12} className="text-[#0f1e38]" />
                              </div>
                              <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                                {ligne.reference}
                              </span>
                            </div>
                          </td>

                          {/* Objet */}
                          <td className="px-4 py-4">
                            <p className="text-sm text-slate-700 line-clamp-2" title={ligne.objet}>
                              {ligne.objet}
                            </p>
                            {ligne.observations && (
                              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                                {ligne.observations}
                              </p>
                            )}
                          </td>

                          {/* Montant */}
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-semibold text-teal-600 tabular-nums whitespace-nowrap">
                              {formatCurrency(Number(ligne.montantEstimatif || 0))}
                            </span>
                          </td>

                          {/* Méthode */}
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium whitespace-nowrap">
                              {METHODE_LABELS[ligne.methodeProcedure] || ligne.methodeProcedure}
                            </span>
                          </td>

                          {/* Trimestre */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold">
                              {TRIMESTRE_LABELS[ligne.trimestre] || ligne.trimestre}
                            </span>
                          </td>

                          {/* Responsable */}
                          <td className="px-4 py-4">
                            {ligne.responsable ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                  <User size={14} className="text-purple-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate whitespace-nowrap">
                                    {ligne.responsable.firstName} {ligne.responsable.lastName}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>

                          {/* Activity */}
                          <td className="px-4 py-4">
                            {ligne.activity ? (
                              <span className="text-sm text-slate-600 truncate block max-w-[200px]" title={ligne.activity.title}>
                                {ligne.activity.title}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {lignes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'T1',
                    value: lignes.filter((l: any) => l.trimestre === 1).length,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                  },
                  {
                    label: 'T2',
                    value: lignes.filter((l: any) => l.trimestre === 2).length,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                  },
                  {
                    label: 'T3',
                    value: lignes.filter((l: any) => l.trimestre === 3).length,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                  },
                  {
                    label: 'T4',
                    value: lignes.filter((l: any) => l.trimestre === 4).length,
                    color: 'text-purple-600',
                    bg: 'bg-purple-50',
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className={cn('rounded-2xl border border-slate-200 p-4 flex items-center justify-between', stat.bg)}
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                        Trimestre {stat.label}
                      </p>
                      <p className={cn('text-2xl font-bold tabular-nums mt-1', stat.color)}>
                        {stat.value}
                      </p>
                    </div>
                    <Calendar size={20} className="text-slate-300" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <AddLignePPMModal
        open={addLigneModalOpen}
        onClose={() => setAddLigneModalOpen(false)}
        ppmId={ppmId}
      />

      {ppm && (
        <EditPPMModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          ppm={ppm}
        />
      )}
    </div>
  );
}
