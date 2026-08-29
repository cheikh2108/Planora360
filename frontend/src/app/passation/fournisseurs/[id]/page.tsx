'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { fournisseursApi } from '@/lib/api';
import type { Fournisseur, FournisseurDocument, EvaluationFournisseur } from '@/lib/types-passation';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Trash2,
  Star,
  Package,
  FileCheck,
  Ban,
  PlayCircle,
  PauseCircle,
  Calendar,
  User,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function FournisseurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fournisseurId = params.id as string;

  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistMotif, setBlacklistMotif] = useState('');

  const { data: fournisseur, isLoading } = useQuery({
    queryKey: ['fournisseur', fournisseurId],
    queryFn: async () => {
      const res = await fournisseursApi.getOne(fournisseurId);
      return res.data as Fournisseur;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (motif?: string) => {
      await fournisseursApi.suspend(fournisseurId, motif);
    },
    onSuccess: () => {
      toast.success('Fournisseur suspendu avec succès');
      queryClient.invalidateQueries({ queryKey: ['fournisseur', fournisseurId] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suspension');
    },
  });

  const blacklistMutation = useMutation({
    mutationFn: async () => {
      if (!blacklistMotif.trim()) {
        throw new Error('Le motif est obligatoire');
      }
      await fournisseursApi.blacklist(fournisseurId, blacklistMotif.trim());
    },
    onSuccess: () => {
      toast.success('Fournisseur blacklisté avec succès');
      queryClient.invalidateQueries({ queryKey: ['fournisseur', fournisseurId] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      setShowBlacklistModal(false);
      setBlacklistMotif('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du blacklistage');
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      await fournisseursApi.activate(fournisseurId);
    },
    onSuccess: () => {
      toast.success('Fournisseur activé avec succès');
      queryClient.invalidateQueries({ queryKey: ['fournisseur', fournisseurId] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'activation');
    },
  });

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusActions = () => {
    if (!fournisseur) return null;

    const actions = [];

    switch (fournisseur.status) {
      case 'A_VALIDER':
        actions.push(
          <Button
            key="activate"
            onClick={() => activateMutation.mutate()}
            disabled={activateMutation.isPending}
            icon={<PlayCircle size={16} />}
            className="bg-green-600 hover:bg-green-700"
          >
            Activer
          </Button>
        );
        actions.push(
          <Button
            key="blacklist"
            onClick={() => setShowBlacklistModal(true)}
            variant="outline"
            icon={<Ban size={16} />}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Blacklister
          </Button>
        );
        break;

      case 'ACTIF':
        actions.push(
          <Button
            key="suspend"
            onClick={() => suspendMutation.mutate()}
            disabled={suspendMutation.isPending}
            variant="outline"
            icon={<PauseCircle size={16} />}
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            Suspendre
          </Button>
        );
        actions.push(
          <Button
            key="blacklist"
            onClick={() => setShowBlacklistModal(true)}
            variant="outline"
            icon={<Ban size={16} />}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Blacklister
          </Button>
        );
        break;

      case 'SUSPENDU':
        actions.push(
          <Button
            key="activate"
            onClick={() => activateMutation.mutate()}
            disabled={activateMutation.isPending}
            icon={<PlayCircle size={16} />}
            className="bg-green-600 hover:bg-green-700"
          >
            Réactiver
          </Button>
        );
        actions.push(
          <Button
            key="blacklist"
            onClick={() => setShowBlacklistModal(true)}
            variant="outline"
            icon={<Ban size={16} />}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Blacklister
          </Button>
        );
        break;

      case 'BLACKLISTE':
        // Aucune action possible pour un fournisseur blacklisté
        break;

      case 'ARCHIVE':
        actions.push(
          <Button
            key="activate"
            onClick={() => activateMutation.mutate()}
            disabled={activateMutation.isPending}
            icon={<PlayCircle size={16} />}
            className="bg-green-600 hover:bg-green-700"
          >
            Réactiver
          </Button>
        );
        break;
    }

    return actions;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!fournisseur) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Fournisseur introuvable</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ce fournisseur n'existe pas ou a été supprimé.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/passation/fournisseurs')}
            className="mt-4"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={fournisseur.raisonSociale}
        description={`Référence: ${fournisseur.reference}`}
        actions={
          <div className="flex items-center gap-3">
            {getStatusActions()}
            <Button
              variant="outline"
              icon={<ArrowLeft size={16} />}
              onClick={() => router.push('/passation/fournisseurs')}
            >
              Retour
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Status & Info Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {fournisseur.raisonSociale}
                    </h2>
                    <p className="mt-1 font-mono text-sm text-slate-500">
                      Réf: {fournisseur.reference}
                    </p>
                    <div className="mt-2">
                      <PassationStatusBadge status={fournisseur.status} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {fournisseur.identifiantFiscal && (
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                    <FileCheck className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-xs font-medium text-slate-600">Identifiant fiscal</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        {fournisseur.identifiantFiscal}
                      </p>
                    </div>
                  </div>
                )}

                {fournisseur.registreCommerce && (
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                    <FileText className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-xs font-medium text-slate-600">Registre de commerce</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        {fournisseur.registreCommerce}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <User className="h-5 w-5 text-blue-600" />
                Informations de contact
              </h3>

              <div className="space-y-4">
                {fournisseur.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Email</p>
                      <a
                        href={`mailto:${fournisseur.email}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {fournisseur.email}
                      </a>
                    </div>
                  </div>
                )}

                {fournisseur.telephone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Téléphone</p>
                      <a
                        href={`tel:${fournisseur.telephone}`}
                        className="text-sm font-medium text-slate-900"
                      >
                        {fournisseur.telephone}
                      </a>
                    </div>
                  </div>
                )}

                {fournisseur.nomContact && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Personne de contact</p>
                      <p className="text-sm font-medium text-slate-900">{fournisseur.nomContact}</p>
                    </div>
                  </div>
                )}

                {(fournisseur.adresse || fournisseur.ville || fournisseur.pays) && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">Adresse</p>
                      <div className="mt-1 text-sm text-slate-900">
                        {fournisseur.adresse && <p>{fournisseur.adresse}</p>}
                        {(fournisseur.ville || fournisseur.pays) && (
                          <p>
                            {fournisseur.ville}
                            {fournisseur.ville && fournisseur.pays && ', '}
                            {fournisseur.pays}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!fournisseur.email && !fournisseur.telephone && !fournisseur.nomContact && !fournisseur.adresse && (
                <div className="rounded-lg bg-slate-50 p-8 text-center">
                  <User className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">
                    Aucune information de contact disponible
                  </p>
                </div>
              )}
            </div>

            {/* Domaines d'activité */}
            {fournisseur.domainesActivite && fournisseur.domainesActivite.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Domaines d'activité
                </h3>
                <div className="flex flex-wrap gap-2">
                  {fournisseur.domainesActivite.map((domaine, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {domaine}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FileText className="h-5 w-5 text-blue-600" />
                Documents
              </h3>

              {fournisseur.documents && fournisseur.documents.length > 0 ? (
                <div className="space-y-2">
                  {fournisseur.documents.map((doc: FournisseurDocument) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.nom}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="rounded bg-slate-100 px-2 py-0.5">{doc.type}</span>
                            <span>•</span>
                            <span>Ajouté le {formatDate(doc.uploadedAt)}</span>
                            {doc.dateExpiration && (
                              <>
                                <span>•</span>
                                <span className={new Date(doc.dateExpiration) < new Date() ? 'text-red-600 font-medium' : ''}>
                                  Expire le {formatDate(doc.dateExpiration)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Télécharger"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">Aucun document associé</p>
                </div>
              )}
            </div>

            {/* Évaluations */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Star className="h-5 w-5 text-blue-600" />
                Historique des évaluations
              </h3>

              {fournisseur.evaluations && fournisseur.evaluations.length > 0 ? (
                <div className="space-y-4">
                  {fournisseur.evaluations.map((eval: EvaluationFournisseur) => (
                    <div
                      key={eval.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                              <span className="text-xl font-bold text-slate-900">
                                {eval.noteGlobale.toFixed(1)}
                              </span>
                              <span className="text-sm text-slate-600">/5</span>
                            </div>
                            {eval.evaluateur && (
                              <span className="text-sm text-slate-600">
                                par {eval.evaluateur.firstName} {eval.evaluateur.lastName}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-4">
                            {eval.noteQualite !== null && (
                              <div>
                                <p className="text-xs text-slate-600">Qualité</p>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {eval.noteQualite}/5
                                </p>
                              </div>
                            )}
                            {eval.noteDelai !== null && (
                              <div>
                                <p className="text-xs text-slate-600">Délai</p>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {eval.noteDelai}/5
                                </p>
                              </div>
                            )}
                            {eval.noteConformite !== null && (
                              <div>
                                <p className="text-xs text-slate-600">Conformité</p>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {eval.noteConformite}/5
                                </p>
                              </div>
                            )}
                          </div>

                          {eval.commentaire && (
                            <p className="mt-3 text-sm text-slate-700 italic">
                              "{eval.commentaire}"
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">{formatDate(eval.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-8 text-center">
                  <Star className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">Aucune évaluation disponible</p>
                </div>
              )}
            </div>

            {/* Remarques */}
            {fournisseur.remarques && (
              <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-6 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  Remarques
                </h3>
                <p className="text-sm text-amber-800 whitespace-pre-wrap">
                  {fournisseur.remarques}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">Soumissions</p>
                    <p className="mt-0.5 text-2xl font-bold text-slate-900">
                      {fournisseur._count?.soumissions || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <FileCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">Contrats</p>
                    <p className="mt-0.5 text-2xl font-bold text-slate-900">
                      {fournisseur._count?.contrats || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">Évaluations</p>
                    <p className="mt-0.5 text-2xl font-bold text-slate-900">
                      {fournisseur._count?.evaluations || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Soumissions récentes */}
            {fournisseur.soumissions && fournisseur.soumissions.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Soumissions récentes
                </h3>
                <div className="space-y-3">
                  {fournisseur.soumissions.slice(0, 5).map((soumission: any) => (
                    <div
                      key={soumission.id}
                      className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {soumission.procedure?.reference || 'N/A'}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                        <span>{formatDate(soumission.dateDepot)}</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(soumission.montantPropose)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contrats actifs */}
            {fournisseur.contrats && fournisseur.contrats.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  Contrats actifs
                </h3>
                <div className="space-y-3">
                  {fournisseur.contrats.slice(0, 5).map((contrat: any) => (
                    <div
                      key={contrat.id}
                      className="cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                      onClick={() => router.push(`/passation/contrats/${contrat.id}`)}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {contrat.reference}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <PassationStatusBadge status={contrat.status} />
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(contrat.montantInitial)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Informations système</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600">Créé le</p>
                  <p className="mt-0.5 text-sm text-slate-900">{formatDate(fournisseur.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Dernière mise à jour</p>
                  <p className="mt-0.5 text-sm text-slate-900">{formatDate(fournisseur.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Organisation</p>
                  <p className="mt-0.5 font-mono text-sm text-slate-900">
                    {fournisseur.organizationId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Blacklister le fournisseur</h3>
                <p className="text-sm text-slate-600">Cette action nécessite une justification</p>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="motif"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Motif du blacklistage <span className="text-red-500">*</span>
              </label>
              <textarea
                id="motif"
                value={blacklistMotif}
                onChange={(e) => setBlacklistMotif(e.target.value)}
                placeholder="Veuillez préciser les raisons du blacklistage..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBlacklistModal(false);
                  setBlacklistMotif('');
                }}
                disabled={blacklistMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                onClick={() => blacklistMutation.mutate()}
                disabled={blacklistMutation.isPending || !blacklistMotif.trim()}
                icon={
                  blacklistMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Ban size={16} />
                  )
                }
                className="bg-red-600 hover:bg-red-700"
              >
                {blacklistMutation.isPending ? 'Traitement...' : 'Blacklister'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
