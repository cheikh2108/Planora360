'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PassationStatusBadge } from '@/components/passation/PassationStatusBadge';
import { WorkflowTimeline } from '@/components/passation/WorkflowTimeline';
import { demandesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { DemandeAchat } from '@/lib/types-passation';
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Building2,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const PRIORITE_CONFIG = {
  BASSE: { label: 'Basse', className: 'bg-slate-100 text-slate-700' },
  NORMALE: { label: 'Normale', className: 'bg-blue-100 text-blue-700' },
  HAUTE: { label: 'Haute', className: 'bg-amber-100 text-amber-700' },
  URGENTE: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
};

export default function DemandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const demandeId = params.id as string;

  const [showValidationForm, setShowValidationForm] = useState(false);
  const [decision, setDecision] = useState<'APPROUVE' | 'REJETE'>('APPROUVE');
  const [commentaire, setCommentaire] = useState('');

  const { data: demande, isLoading } = useQuery({
    queryKey: ['demande', demandeId],
    queryFn: async () => {
      const res = await demandesApi.getOne(demandeId);
      return res.data as DemandeAchat;
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      await demandesApi.validate(demandeId, {
        decision,
        commentaire: commentaire.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(
        decision === 'APPROUVE'
          ? 'Demande approuvée avec succès'
          : 'Demande rejetée avec succès'
      );
      queryClient.invalidateQueries({ queryKey: ['demande', demandeId] });
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      setShowValidationForm(false);
      setCommentaire('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la validation');
    },
  });

  const formatCurrencyAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Vérifier si l'utilisateur est validateur en attente
  const pendingValidation = demande?.validations?.find(
    (v) => v.decision === 'EN_ATTENTE' && v.validateurId === user?.id
  );

  const canValidate = Boolean(pendingValidation);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Demande introuvable</h2>
          <p className="mt-2 text-sm text-slate-600">
            Cette demande n'existe pas ou a été supprimée.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/passation/demandes')}
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
        title={`Demande ${demande.reference}`}
        description="Détails et workflow de validation"
        actions={
          <Button
            variant="outline"
            icon={<ArrowLeft size={16} />}
            onClick={() => router.push('/passation/demandes')}
          >
            Retour
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Status & Priority Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Statut :</span>
                    <PassationStatusBadge status={demande.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Priorité :</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        PRIORITE_CONFIG[demande.priorite].className
                      }`}
                    >
                      {PRIORITE_CONFIG[demande.priorite].label}
                    </span>
                  </div>
                </div>
                {canValidate && !showValidationForm && (
                  <Button
                    onClick={() => setShowValidationForm(true)}
                    icon={<CheckCircle size={16} />}
                  >
                    Valider
                  </Button>
                )}
              </div>
            </div>

            {/* Validation Form */}
            {showValidationForm && canValidate && (
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Validation en attente</h3>
                </div>

                <p className="mb-4 text-sm text-blue-800">
                  Vous êtes en charge de la validation à l'étape :{' '}
                  <span className="font-semibold">{pendingValidation.etape}</span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">
                      Décision <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDecision('APPROUVE')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all ${
                          decision === 'APPROUVE'
                            ? 'border-green-600 bg-green-50 text-green-900'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-green-400'
                        }`}
                      >
                        <CheckCircle size={20} />
                        <span className="font-medium">Approuver</span>
                      </button>
                      <button
                        onClick={() => setDecision('REJETE')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all ${
                          decision === 'REJETE'
                            ? 'border-red-600 bg-red-50 text-red-900'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-red-400'
                        }`}
                      >
                        <XCircle size={20} />
                        <span className="font-medium">Rejeter</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="commentaire"
                      className="mb-2 block text-sm font-medium text-slate-900"
                    >
                      Commentaire {decision === 'REJETE' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      id="commentaire"
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      placeholder={
                        decision === 'REJETE'
                          ? 'Veuillez préciser les raisons du rejet...'
                          : 'Commentaire optionnel...'
                      }
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowValidationForm(false);
                        setCommentaire('');
                        setDecision('APPROUVE');
                      }}
                      disabled={validateMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={() => validateMutation.mutate()}
                      disabled={
                        validateMutation.isPending ||
                        (decision === 'REJETE' && !commentaire.trim())
                      }
                      icon={
                        validateMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : decision === 'APPROUVE' ? (
                          <CheckCircle size={16} />
                        ) : (
                          <XCircle size={16} />
                        )
                      }
                      className={
                        decision === 'REJETE'
                          ? 'bg-red-600 hover:bg-red-700'
                          : undefined
                      }
                    >
                      {validateMutation.isPending
                        ? 'Traitement...'
                        : decision === 'APPROUVE'
                        ? 'Approuver la demande'
                        : 'Rejeter la demande'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Details Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FileText className="h-5 w-5 text-blue-600" />
                Détails de la demande
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Objet</label>
                  <p className="mt-1 text-base text-slate-900">{demande.objet}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600">
                    Justification
                  </label>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {demande.justification}
                  </p>
                </div>

                {demande.lignePpm && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600">
                      Ligne PPM associée
                    </label>
                    <div className="mt-1 rounded-md bg-slate-50 p-3">
                      <p className="font-medium text-slate-900">
                        {demande.lignePpm.reference}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {demande.lignePpm.objetMarche}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Timeline */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-slate-900">
                Workflow de validation
              </h2>
              {demande.validations && demande.validations.length > 0 ? (
                <WorkflowTimeline validations={demande.validations} />
              ) : (
                <div className="rounded-lg bg-slate-50 p-8 text-center">
                  <Clock className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">
                    Aucune validation configurée pour cette demande
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Informations clés</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">Montant estimé</p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">
                      {formatCurrencyAmount(demande.montantEstime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">Date de nécessité</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {formatDate(demande.dateNecessite)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-600">Demandeur</p>
                    {demande.demandeur ? (
                      <>
                        <p className="mt-0.5 font-semibold text-slate-900">
                          {demande.demandeur.firstName} {demande.demandeur.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{demande.demandeur.email}</p>
                      </>
                    ) : (
                      <p className="mt-0.5 text-sm text-slate-500">Non spécifié</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Suivi</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600">Créée le</p>
                  <p className="mt-0.5 text-sm text-slate-900">{formatDate(demande.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Dernière mise à jour</p>
                  <p className="mt-0.5 text-sm text-slate-900">{formatDate(demande.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Référence</p>
                  <p className="mt-0.5 font-mono text-sm font-medium text-blue-600">
                    {demande.reference}
                  </p>
                </div>
              </div>
            </div>

            {/* Organization */}
            {demande.organizationId && (
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-blue-900">
                  <Building2 className="h-5 w-5" />
                  <h3 className="font-semibold">Organisation</h3>
                </div>
                <p className="mt-2 text-sm text-blue-700">ID: {demande.organizationId}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
