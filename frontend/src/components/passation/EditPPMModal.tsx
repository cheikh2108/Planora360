'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ppmApi, plansApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import type { PlanPassationMarche } from '@/lib/types-passation';

interface EditPPMModalProps {
  open: boolean;
  onClose: () => void;
  ppm: PlanPassationMarche;
}

export function EditPPMModal({ open, onClose, ppm }: EditPPMModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: ppm.title,
    projectId: ppm.projectId || '',
  });

  // Reset form when PPM changes
  useEffect(() => {
    setFormData({
      title: ppm.title,
      projectId: ppm.projectId || '',
    });
  }, [ppm]);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await plansApi.list({ limit: 100 });
      const result = res.data as { data: any[] };
      return Array.isArray(result.data) ? result.data : [];
    },
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const payload: any = {
        title: data.title,
      };
      // Omettre projectId si vide (string vide invalide)
      if (data.projectId) {
        payload.projectId = data.projectId;
      } else {
        // Envoyer null pour dissocier du projet
        payload.projectId = null;
      }
      return ppmApi.update(ppm.id, payload);
    },
    onSuccess: () => {
      success('PPM modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['ppm'] });
      queryClient.invalidateQueries({ queryKey: ['ppm', ppm.id] });
      onClose();
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Modal open={open} onClose={onClose} title="Modifier le PPM" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info: Année non modifiable */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Note :</strong> L'année ne peut pas être modifiée (règle : 1 PPM par année).
            Pour changer d'année, créez un nouveau PPM.
          </p>
        </div>

        <FormField label="Année" required>
          <Input
            type="number"
            value={ppm.year}
            disabled
            className="bg-slate-100 cursor-not-allowed"
          />
        </FormField>

        <FormField label="Titre" required>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: PPM 2026 - Projet XYZ"
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
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
