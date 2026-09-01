'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { demandesApi, ppmApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Textarea, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

interface CreateDemandeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CreateDemandeModal({ open, onClose, onSuccess }: CreateDemandeModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    objet: '',
    justification: '',
    montantEstime: '',
    echeanceSouhaitee: '',
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
        justification: data.justification,
        montantEstimatif: parseFloat(data.montantEstime),
      };
      // Champs optionnels
      if (data.echeanceSouhaitee) {
        payload.echeanceSouhaitee = data.echeanceSouhaitee;
      }
      if (data.lignePpmId) {
        payload.lignePpmId = data.lignePpmId;
      }
      return demandesApi.create(payload);
    },
    onSuccess: (res) => {
      success('Demande créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['demandes'] });
      setFormData({
        objet: '',
        justification: '',
        montantEstime: '',
        echeanceSouhaitee: '',
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
    <Modal open={open} onClose={onClose} title="Nouvelle Demande d'Achat" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Montant estimé (XOF)" required>
            <Input
              type="number"
              step="0.01"
              value={formData.montantEstime}
              onChange={(e) => setFormData({ ...formData, montantEstime: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Échéance souhaitée">
            <Input
              type="date"
              value={formData.echeanceSouhaitee}
              onChange={(e) => setFormData({ ...formData, echeanceSouhaitee: e.target.value })}
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
            {createMutation.isPending ? 'Création...' : 'Créer la demande'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
