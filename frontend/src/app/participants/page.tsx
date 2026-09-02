'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Upload, Trash2, FileSpreadsheet, Phone, CreditCard, DollarSign, Users, Loader2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function ParticipantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      loadParticipants(selectedActivityId);
    } else if (!loadingActivities) {
      // Ne mettre loading à false que si on a fini de charger les activités
      setParticipants([]);
      setLoading(false);
    }
  }, [selectedActivityId, loadingActivities]);

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await api.get('/activities?limit=100');
      const activitiesData = response.data.data || [];
      setActivities(activitiesData);

      // Sélectionner automatiquement la première activité si elle existe
      if (activitiesData.length > 0) {
        setSelectedActivityId(activitiesData[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur chargement activités:', error);
      setLoading(false);
    } finally {
      setLoadingActivities(false);
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

  const stats = {
    total: participants.length,
    montantTotal: participants.reduce((sum, p) => sum + (p.amount || 0), 0),
    wave: participants.filter(p => p.paymentMode === 'WAVE').length,
    orange: participants.filter(p => p.paymentMode === 'ORANGE_MONEY').length,
    montantWave: participants.filter(p => p.paymentMode === 'WAVE').reduce((sum, p) => sum + (p.amount || 0), 0),
    montantOrange: participants.filter(p => p.paymentMode === 'ORANGE_MONEY').reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Participants"
          subtitle="Gérez les participants de vos activités"
        />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Participants"
        subtitle={selectedActivityId && participants.length > 0 ? `${stats.total} participant${stats.total > 1 ? 's' : ''}` : 'Gérez les participants de vos activités'}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              icon={<Upload size={16} />}
              onClick={() => router.push('/participants/import')}
              className="hidden sm:flex"
            >
              Importer Excel
            </Button>
            <Button
              icon={<UserPlus size={16} />}
              onClick={() => router.push('/participants/new')}
            >
              <span className="hidden sm:inline">Ajouter</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* KPI Cards */}
        {selectedActivityId && participants.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white', icon: Users },
              { label: 'Montant Total', value: `${(stats.montantTotal / 1000).toFixed(0)}k`, color: 'text-green-600', bg: 'bg-green-50', icon: DollarSign },
              { label: 'Wave', value: stats.wave, color: 'text-blue-600', bg: 'bg-blue-50', icon: CreditCard },
              { label: 'Orange Money', value: stats.orange, color: 'text-orange-600', bg: 'bg-orange-50', icon: CreditCard },
              { label: 'Wave (FCFA)', value: `${(stats.montantWave / 1000).toFixed(0)}k`, color: 'text-blue-600', bg: 'bg-blue-50', icon: DollarSign },
              { label: 'Orange (FCFA)', value: `${(stats.montantOrange / 1000).toFixed(0)}k`, color: 'text-orange-600', bg: 'bg-orange-50', icon: DollarSign },
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

        {/* Filtre par activité */}
        {activities.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-slate-600" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Filtres</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-900 whitespace-nowrap">
                Activité :
              </label>
              <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                <SelectTrigger className="w-full max-w-md h-9">
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
        {participants.length === 0 ? (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Aucun participant
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                {selectedActivityId
                  ? "Cette activité n'a pas encore de participants"
                  : "Sélectionnez une activité pour voir ses participants"}
              </p>
              {selectedActivityId && (
                <Button
                  icon={<UserPlus size={16} />}
                  onClick={() => router.push('/participants/new')}
                >
                  Ajouter un participant
                </Button>
              )}
            </div>

            {/* Format attendu */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={14} className="text-slate-600" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    Format du Fichier Excel
                  </p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-600 mb-4">Votre fichier doit contenir les colonnes suivantes :</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-32 shrink-0 font-medium text-slate-900">Prénom</div>
                    <div className="text-slate-600">Prénom du participant</div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-32 shrink-0 font-medium text-slate-900">Nom</div>
                    <div className="text-slate-600">Nom du participant</div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-32 shrink-0 font-medium text-slate-900 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-600" />
                      Téléphone
                    </div>
                    <div className="text-slate-600">Numéro de téléphone</div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-32 shrink-0 font-medium text-slate-900 flex items-center gap-1.5">
                      <CreditCard size={12} className="text-slate-600" />
                      Mode de paiement
                    </div>
                    <div className="text-slate-600">WAVE ou ORANGE_MONEY</div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-32 shrink-0 font-medium text-slate-900 flex items-center gap-1.5">
                      <DollarSign size={12} className="text-slate-600" />
                      Montant
                    </div>
                    <div className="text-slate-600">Montant en FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-600" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Liste des Participants
                </p>
              </div>
              <span className="text-xs tabular-nums text-slate-600">{participants.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Prénom
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Nom
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Téléphone
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Mode de paiement
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Montant
                    </th>
                    <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">{participant.firstName}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">{participant.lastName}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{participant.phone}</td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide',
                            participant.paymentMode === 'WAVE'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-orange-50 text-orange-700'
                          )}
                        >
                          <CreditCard size={12} />
                          {getPaymentModeLabel(participant.paymentMode)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-900 text-right font-semibold tabular-nums">
                        {formatAmount(participant.amount)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDelete(participant.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Total : {participants.length} participant{participants.length > 1 ? 's' : ''}
                </span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
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
