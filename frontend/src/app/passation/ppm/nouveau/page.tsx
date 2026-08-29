'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ppmApi, plansApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';

export default function NouveauPPMPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    projectId: '',
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await plansApi.getAllProjects();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ppmApi.create(data),
    onSuccess: (res) => {
      showToast('PPM créé avec succès', 'success');
      router.push(`/passation/ppm/${res.data.id}`);
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
        title="Nouveau Plan de Passation des Marchés"
        description="Créer un nouveau PPM pour planifier les marchés de l'année"
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Année" required>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min={new Date().getFullYear()}
                required
              />
            </FormField>

            <FormField label="Projet (optionnel)">
              <Select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="">-- Aucun projet --</option>
                {projects?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Création...' : 'Créer le PPM'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
