'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ppmApi, plansApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

interface CreatePPMModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CreatePPMModal({ open, onClose, onSuccess }: CreatePPMModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: '',
    projectId: '',
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await plansApi.list({ limit: 100 });
      const result = res.data as { data: any[] };
      return Array.isArray(result.data) ? result.data : [];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const payload: any = {
        year: data.year,
        title: data.title,
      };
      // Omettre projectId si vide (string vide invalide)
      if (data.projectId) {
        payload.projectId = data.projectId;
      }
      return ppmApi.create(payload);
    },
    onSuccess: (res) => {
      success('PPM créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['ppm'] });
      setFormData({
        year: new Date().getFullYear(),
        title: '',
        projectId: '',
      });
      onClose();
      if (onSuccess) onSuccess(res.data.id);
    },
    onError: (err: any) => {
      error(err.message || 'Erreur lors de la création');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau Plan de Passation des Marchés" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Titre" required>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: PPM 2026 - Projet XYZ"
            required
          />
        </FormField>

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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Création...' : 'Créer le PPM'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
