'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Upload, Trash2, FileSpreadsheet, Phone, CreditCard, DollarSign } from 'lucide-react';
import api from '@/lib/api';

export default function ParticipantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      loadParticipants(selectedActivityId);
    } else {
      setParticipants([]);
      setLoading(false);
    }
  }, [selectedActivityId]);

  const loadActivities = async () => {
    try {
      const response = await api.get('/activities?limit=100');
      const activitiesData = response.data.data || [];
      setActivities(activitiesData);

      // Sélectionner automatiquement la première activité si elle existe
      if (activitiesData.length > 0) {
        setSelectedActivityId(activitiesData[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    }
  };

  const loadParticipants = async (activityId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/participants/activity/${activityId}`);
      setParticipants(response.data || []);
    } catch (error) {
      console.error('Erreur chargement participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) return;

    try {
      await api.delete(`/participants/${id}`);
      setParticipants(participants.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Erreur suppression participant:', error);
      alert('Erreur lors de la suppression du participant');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentModeLabel = (mode: string) => {
    return mode === 'WAVE' ? 'Wave' : 'Orange Money';
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Participants"
        subtitle="Gérez les participants de vos activités"
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/participants/import')}>
              <Upload size={14} className="mr-1.5" />
              Importer Excel
            </Button>
            <Button onClick={() => router.push('/participants/new')}>
              <UserPlus size={14} className="mr-1.5" />
              Ajouter
            </Button>
          </>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* Filtre par activité */}
        {activities.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Activité :
              </label>
              <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Sélectionnez une activité" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Liste des participants */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prénom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mode de paiement</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                      <td className="px-4 py-3"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                      <td className="px-4 py-3 text-center"><div className="h-8 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : participants.length === 0 ? (
          <>
            <EmptyState
              icon={UserPlus}
              title="Aucun participant"
              description={
                selectedActivityId
                  ? "Cette activité n'a pas encore de participants"
                  : "Sélectionnez une activité pour voir ses participants"
              }
              action={
                selectedActivityId ? (
                  <div className="flex gap-2">
                    <Button onClick={() => router.push('/participants/new')}>
                      <UserPlus size={14} className="mr-1.5" />
                      Ajouter un participant
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/participants/import')}>
                      <Upload size={14} className="mr-1.5" />
                      Importer Excel
                    </Button>
                  </div>
                ) : undefined
              }
            />

            {/* Format attendu */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#0f1e38] flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Format du fichier Excel</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Votre fichier doit contenir les colonnes suivantes</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-32 shrink-0 font-medium text-slate-700">Prénom</div>
                  <div className="text-slate-500">Prénom du participant</div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-32 shrink-0 font-medium text-slate-700">Nom</div>
                  <div className="text-slate-500">Nom du participant</div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-32 shrink-0 font-medium text-slate-700 flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" />
                    Téléphone
                  </div>
                  <div className="text-slate-500">Numéro de téléphone</div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-32 shrink-0 font-medium text-slate-700 flex items-center gap-1.5">
                    <CreditCard size={12} className="text-slate-400" />
                    Mode de paiement
                  </div>
                  <div className="text-slate-500">WAVE ou ORANGE_MONEY</div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-32 shrink-0 font-medium text-slate-700 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-slate-400" />
                    Montant
                  </div>
                  <div className="text-slate-500">Montant en FCFA</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Prénom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mode de paiement
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{participant.firstName}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{participant.lastName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{participant.phone}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            participant.paymentMode === 'WAVE'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          <CreditCard size={12} />
                          {getPaymentModeLabel(participant.paymentMode)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                        {formatAmount(participant.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(participant.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Total : {participants.length} participant{participants.length > 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatAmount(participants.reduce((sum, p) => sum + (p.amount || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
