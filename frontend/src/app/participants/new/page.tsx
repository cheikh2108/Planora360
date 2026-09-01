'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import api from '@/lib/api';

export default function NewParticipantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    paymentMode: 'WAVE',
    amount: '',
    activityId: '',
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await api.get('/activities?limit=100');
      // L'API retourne { data: [...], total, page, limit }
      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement activités:', error);
      alert('Erreur lors du chargement des activités');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/participants', {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
      });
      router.push('/participants');
    } catch (error) {
      console.error('Erreur création participant:', error);
      alert('Erreur lors de la création du participant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Nouveau participant"
        subtitle="Ajoutez un participant manuellement"
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6">
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-slate-900">
                  Prénom *
                </label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ex: Marie"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-slate-900">
                  Nom *
                </label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Ex: Diallo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-slate-900">
                Téléphone *
              </label>
              <Input
                id="phone"
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ex: +221 77 123 45 67"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="paymentMode" className="text-sm font-medium text-slate-900">
                  Mode de paiement *
                </label>
                <Select
                  value={formData.paymentMode}
                  onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WAVE">Wave</SelectItem>
                    <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-slate-900">
                  Montant (FCFA)
                </label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Ex: 5000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="activityId" className="text-sm font-medium text-slate-900">
                Activité *
              </label>
              {loadingActivities ? (
                <div className="h-10 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <span className="text-sm text-slate-500">Chargement des activités...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="h-10 rounded-md border border-slate-200 bg-red-50 flex items-center px-3">
                  <span className="text-sm text-red-600">Aucune activité disponible</span>
                </div>
              ) : (
                <Select
                  value={formData.activityId}
                  onValueChange={(value) => setFormData({ ...formData, activityId: value })}
                >
                  <SelectTrigger>
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
              )}
              <p className="text-xs text-slate-500">
                L'activité à laquelle ce participant sera rattaché
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={loading}
                disabled={!formData.activityId || activities.length === 0}
              >
                <Save size={14} className="mr-1.5" />
                Enregistrer
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
