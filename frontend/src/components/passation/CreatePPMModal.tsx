'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ppmApi, plansApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import { AlertCircle } from 'lucide-react';

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

        {/* Section d'aide - Règle 1 PPM par année */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-900">
                📋 Règle importante : 1 PPM par année
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Chaque organisation peut créer <strong>un seul PPM par année</strong>.
                Si vous avez déjà un PPM pour l'année sélectionnée, vous devez :
              </p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                <li><strong>Modifier le PPM existant</strong> : Cliquez sur le PPM dans la liste, puis sur le bouton "Modifier" (visible si brouillon)</li>
                <li><strong>Supprimer le brouillon</strong> : Si le PPM existant est en brouillon, vous pouvez le supprimer avant d'en créer un nouveau</li>
                <li><strong>Choisir une autre année</strong> : Créez un PPM pour une année différente</li>
              </ul>
              <p className="text-xs text-blue-700 italic mt-2">
                💡 Cette règle assure qu'un seul document de planification officiel existe par an.
              </p>
            </div>
          </div>
        </div>

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
