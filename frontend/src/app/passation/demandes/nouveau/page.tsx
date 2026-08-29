'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { demandesApi, ppmApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';

const PRIORITES = [
  { value: 'BASSE', label: 'Basse' },
  { value: 'NORMALE', label: 'Normale' },
  { value: 'HAUTE', label: 'Haute' },
  { value: 'URGENTE', label: 'Urgente' },
];

export default function NouvelleDemandePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    objet: '',
    justification: '',
    montantEstime: '',
    dateNecessite: '',
    priorite: 'NORMALE',
    lignePpmId: '',
  });

  const { data: ppms } = useQuery({
    queryKey: ['ppms'],
    queryFn: async () => {
      const res = await ppmApi.getAll({ year: new Date().getFullYear() });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => demandesApi.create({
      ...data,
      montantEstime: parseFloat(data.montantEstime),
    }),
    onSuccess: (res) => {
      showToast('Demande créée avec succès', 'success');
      router.push(`/passation/demandes/${res.data.id}`);
    },
    onError: (error: any) => {
      showToast(error.message || 'Erreur lors de la création', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Nouvelle Demande d'Achat"
        description="Créer une nouvelle demande et lancer le workflow de validation"
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Objet de la demande" required>
              <Input
                value={formData.objet}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                placeholder="Ex: Acquisition matériel informatique"
                required
              />
            </FormField>

            <FormField label="Justification" required>
              <Textarea
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                rows={4}
                placeholder="Décrivez la nécessité de cet achat..."
                required
              />
            </FormField>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Montant estimé (XOF)" required>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.montantEstime}
                  onChange={(e) => setFormData({ ...formData, montantEstime: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Date de nécessité" required>
                <Input
                  type="date"
                  value={formData.dateNecessite}
                  onChange={(e) => setFormData({ ...formData, dateNecessite: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Priorité">
                <Select
                  value={formData.priorite}
                  onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                >
                  {PRIORITES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Lien PPM (optionnel)">
                <Select
                  value={formData.lignePpmId}
                  onChange={(e) => setFormData({ ...formData, lignePpmId: e.target.value })}
                >
                  <option value="">-- Aucune ligne PPM --</option>
                  {ppms?.flatMap((ppm: any) =>
                    (ppm.lignes || []).map((ligne: any) => (
                      <option key={ligne.id} value={ligne.id}>
                        {ppm.reference} - {ligne.objetMarche}
                      </option>
                    )),
                  )}
                </Select>
              </FormField>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Création...' : 'Créer la demande'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
