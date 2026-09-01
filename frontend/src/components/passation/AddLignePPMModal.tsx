'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ppmApi, activitiesApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const METHODES = [
  { value: 'ACHAT_DIRECT', label: 'Achat direct' },
  { value: 'DEMANDE_COTATION', label: 'Demande de cotation' },
  { value: 'CONSULTATION_RESTREINTE', label: 'Consultation restreinte' },
  { value: 'APPEL_OFFRES_OUVERT', label: 'Appel d\'offres ouvert' },
  { value: 'APPEL_OFFRES_RESTREINT', label: 'Appel d\'offres restreint' },
  { value: 'DEMANDE_PROPOSITIONS', label: 'Demande de propositions' },
  { value: 'MANIFESTATION_INTERET', label: 'Manifestation d\'intérêt' },
  { value: 'SELECTION_CONSULTANT', label: 'Sélection de consultant' },
  { value: 'PROCEDURE_URGENCE', label: 'Procédure d\'urgence' },
  { value: 'AUTRE', label: 'Autre' },
];

const TRIMESTRES = [
  { value: 1, label: 'T1 (Janvier-Mars)' },
  { value: 2, label: 'T2 (Avril-Juin)' },
  { value: 3, label: 'T3 (Juillet-Septembre)' },
  { value: 4, label: 'T4 (Octobre-Décembre)' },
];

interface AddLignePPMModalProps {
  open: boolean;
  onClose: () => void;
  ppmId: string;
  onSuccess?: () => void;
}

export function AddLignePPMModal({ open, onClose, ppmId, onSuccess }: AddLignePPMModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    objetMarche: '',
    montantEstime: '',
    methode: 'DEMANDE_COTATION',
    trimestre: 1,
    sourceFinancement: '',
    ligneBudgetaire: '',
    observations: '',
    activityId: '',
  });

  const { data: activities } = useQuery({
    queryKey: ['activities-for-ppm'],
    queryFn: async () => {
      const res = await activitiesApi.list({ limit: 100 });
      const result = res.data as { data: any[] };
      return Array.isArray(result.data) ? result.data : [];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const payload: any = {
        objet: data.objetMarche, // Le schéma Prisma utilise "objet" pas "objetMarche"
        montantEstimatif: parseFloat(data.montantEstime), // Le schéma utilise "montantEstimatif"
        methodeProcedure: data.methode, // Le schéma utilise "methodeProcedure"
        trimestre: parseInt(data.trimestre),
      };
      // N'ajouter que les champs non vides
      if (data.sourceFinancement && data.sourceFinancement.trim()) {
        payload.sourceFinancement = data.sourceFinancement;
      }
      if (data.ligneBudgetaire && data.ligneBudgetaire.trim()) {
        payload.ligneBudgetaire = data.ligneBudgetaire;
      }
      if (data.observations && data.observations.trim()) {
        payload.observations = data.observations;
      }
      if (data.activityId && data.activityId.trim()) {
        payload.activityId = data.activityId;
      }

      console.log('[AddLignePPM] Payload envoyé:', payload);
      return ppmApi.addLigne(ppmId, payload);
    },
    onSuccess: () => {
      success('Ligne ajoutée avec succès');
      queryClient.invalidateQueries({ queryKey: ['ppm', ppmId] });
      queryClient.invalidateQueries({ queryKey: ['ppm'] });
      setFormData({
        objetMarche: '',
        montantEstime: '',
        methode: 'DEMANDE_COTATION',
        trimestre: 1,
        sourceFinancement: '',
        ligneBudgetaire: '',
        observations: '',
        activityId: '',
      });
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      error(err.message || 'Erreur lors de l\'ajout de la ligne');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une ligne au PPM" size="xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Objet du marché" required>
          <Textarea
            value={formData.objetMarche}
            onChange={(e) => setFormData({ ...formData, objetMarche: e.target.value })}
            placeholder="Ex: Fourniture de matériel informatique"
            rows={2}
            required
          />
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Montant estimé (XOF)" required>
            <Input
              type="number"
              step="0.01"
              value={formData.montantEstime}
              onChange={(e) => setFormData({ ...formData, montantEstime: e.target.value })}
              placeholder="Ex: 5000000"
              required
            />
          </FormField>

          <FormField label="Méthode de passation" required>
            <Select
              value={formData.methode}
              onChange={(e) => setFormData({ ...formData, methode: e.target.value })}
              required
            >
              {METHODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Trimestre prévu" required>
            <Select
              value={formData.trimestre}
              onChange={(e) => setFormData({ ...formData, trimestre: parseInt(e.target.value) })}
              required
            >
              {TRIMESTRES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Activité liée (optionnel)">
            <Select
              value={formData.activityId}
              onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
            >
              <option value="">-- Aucune activité --</option>
              {activities?.map((activity: any) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Source de financement">
            <Input
              value={formData.sourceFinancement}
              onChange={(e) => setFormData({ ...formData, sourceFinancement: e.target.value })}
              placeholder="Ex: Budget propre, Subvention"
            />
          </FormField>

          <FormField label="Ligne budgétaire">
            <Input
              value={formData.ligneBudgetaire}
              onChange={(e) => setFormData({ ...formData, ligneBudgetaire: e.target.value })}
              placeholder="Ex: 60-2345"
            />
          </FormField>
        </div>

        <FormField label="Observations">
          <Textarea
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            rows={3}
            placeholder="Remarques ou précisions..."
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Ajout...' : 'Ajouter la ligne'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
