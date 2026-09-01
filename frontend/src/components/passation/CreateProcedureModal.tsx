'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proceduresApi, ppmApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

const METHODES = [
  { value: 'ACHAT_DIRECT', label: 'Achat Direct' },
  { value: 'DEMANDE_COTATION', label: 'Demande de Cotation' },
  { value: 'CONSULTATION_RESTREINTE', label: 'Consultation Restreinte' },
  { value: 'APPEL_OFFRES_OUVERT', label: 'Appel d\'Offres Ouvert' },
  { value: 'APPEL_OFFRES_RESTREINT', label: 'Appel d\'Offres Restreint' },
  { value: 'DEMANDE_PROPOSITIONS', label: 'Demande de Propositions' },
  { value: 'MANIFESTATION_INTERET', label: 'Manifestation d\'Intérêt' },
  { value: 'SELECTION_CONSULTANT', label: 'Sélection de Consultant' },
  { value: 'PROCEDURE_URGENCE', label: 'Procédure d\'Urgence' },
  { value: 'AUTRE', label: 'Autre' },
];

interface CreateProcedureModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CreateProcedureModal({ open, onClose, onSuccess }: CreateProcedureModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    objet: '',
    methode: 'APPEL_OFFRES_OUVERT',
    montantEstime: '',
    datePublication: '',
    dateLimite: '',
    lignePpmId: '',
  });

  const { data: ppms } = useQuery({
    queryKey: ['ppms'],
    queryFn: async () => {
      const res = await ppmApi.getAll({ year: new Date().getFullYear() });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const payload: any = {
        objet: data.objet,
        methode: data.methode,
        montantEstimatif: parseFloat(data.montantEstime),
      };
      // Champs optionnels
      if (data.lignePpmId) payload.lignePpmId = data.lignePpmId;
      if (data.datePublication) payload.datePublication = data.datePublication;
      if (data.dateLimite) payload.dateLimite = data.dateLimite;

      return proceduresApi.create(payload);
    },
    onSuccess: (res) => {
      success('Procédure créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      setFormData({
        objet: '',
        methode: 'APPEL_OFFRES_OUVERT',
        montantEstime: '',
        datePublication: '',
        dateLimite: '',
        lignePpmId: '',
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
    <Modal open={open} onClose={onClose} title="Nouvelle Procédure de Passation" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Objet de la procédure" required>
          <Input
            value={formData.objet}
            onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
            placeholder="Ex: Fourniture de matériel informatique"
            required
          />
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
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

          <FormField label="Montant estimé (XOF)" required>
            <Input
              type="number"
              step="0.01"
              value={formData.montantEstime}
              onChange={(e) => setFormData({ ...formData, montantEstime: e.target.value })}
              required
            />
          </FormField>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Date de publication">
            <Input
              type="date"
              value={formData.datePublication}
              onChange={(e) => setFormData({ ...formData, datePublication: e.target.value })}
            />
          </FormField>

          <FormField label="Date limite de dépôt">
            <Input
              type="date"
              value={formData.dateLimite}
              onChange={(e) => setFormData({ ...formData, dateLimite: e.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Ligne PPM associée (optionnel)">
          <Select
            value={formData.lignePpmId}
            onChange={(e) => setFormData({ ...formData, lignePpmId: e.target.value })}
          >
            <option value="">-- Aucune ligne PPM --</option>
            {ppms?.flatMap((ppm: any) =>
              (ppm.lignes || []).map((ligne: any) => (
                <option key={ligne.id} value={ligne.id}>
                  {ligne.reference} - {ligne.objet}
                </option>
              )),
            )}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Création...' : 'Créer la procédure'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
