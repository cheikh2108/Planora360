'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { fournisseursApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { FormField, Input, Textarea } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';

export default function NouveauFournisseurPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    raisonSociale: '',
    identifiantFiscal: '',
    registreCommerce: '',
    adresse: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    nomContact: '',
    domainesActivite: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fournisseursApi.create(data),
    onSuccess: (res) => {
      showToast('Fournisseur créé avec succès', 'success');
      router.push(`/passation/fournisseurs/${res.data.id}`);
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
        title="Nouveau Fournisseur"
        description="Ajouter un nouveau fournisseur au référentiel"
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Raison sociale" required>
                <Input
                  value={formData.raisonSociale}
                  onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Identifiant fiscal">
                <Input
                  value={formData.identifiantFiscal}
                  onChange={(e) => setFormData({ ...formData, identifiantFiscal: e.target.value })}
                />
              </FormField>

              <FormField label="Registre de commerce">
                <Input
                  value={formData.registreCommerce}
                  onChange={(e) => setFormData({ ...formData, registreCommerce: e.target.value })}
                />
              </FormField>

              <FormField label="Email">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormField>

              <FormField label="Téléphone">
                <Input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </FormField>

              <FormField label="Nom du contact">
                <Input
                  value={formData.nomContact}
                  onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })}
                />
              </FormField>

              <FormField label="Ville">
                <Input
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                />
              </FormField>

              <FormField label="Pays">
                <Input
                  value={formData.pays}
                  onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Adresse">
              <Textarea
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                rows={3}
              />
            </FormField>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Création...' : 'Créer le fournisseur'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
