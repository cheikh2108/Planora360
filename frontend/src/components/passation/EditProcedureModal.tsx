'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proceduresApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select, Textarea } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import type { Procedure } from '@/lib/types-passation';

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

interface EditProcedureModalProps {
  open: boolean;
  onClose: () => void;
  procedure: Procedure;
}

export function EditProcedureModal({ open, onClose, procedure }: EditProcedureModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    objet: '',
    methode: '',
    montantEstimatif: '',
    datePublication: '',
    dateLimite: '',
    dateOuverture: '',
    cahierCharges: '',
  });

  useEffect(() => {
    if (procedure) {
      setFormData({
        objet: procedure.objet || '',
        methode: procedure.methode || '',
        montantEstimatif: String(procedure.montantEstimatif || ''),
        datePublication: procedure.datePublication ? procedure.datePublication.split('T')[0] : '',
        dateLimite: procedure.dateLimite ? procedure.dateLimite.split('T')[0] : '',
        dateOuverture: procedure.dateOuverture ? procedure.dateOuverture.split('T')[0] : '',
        cahierCharges: procedure.cahierCharges || '',
      });
    }
  }, [procedure]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const payload: any = {
        objet: data.objet,
        methode: data.methode,
        montantEstimatif: parseFloat(data.montantEstimatif),
      };

      if (data.datePublication) payload.datePublication = data.datePublication;
      if (data.dateLimite) payload.dateLimite = data.dateLimite;
      if (data.dateOuverture) payload.dateOuverture = data.dateOuverture;
      if (data.cahierCharges) payload.cahierCharges = data.cahierCharges;

      return proceduresApi.update(procedure.id, payload);
    },
    onSuccess: () => {
      success('Procédure mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedures', procedure.id] });
      onClose();
    },
    onError: (err: any) => {
      error(err.message || 'Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Modal open={open} onClose={onClose} title="Modifier la Procédure" size="lg">
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
              value={formData.montantEstimatif}
              onChange={(e) => setFormData({ ...formData, montantEstimatif: e.target.value })}
              required
            />
          </FormField>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-900 mb-3">
            ⚠️ Dates requises pour publier la procédure
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Date de publication">
              <Input
                type="date"
                value={formData.datePublication}
                onChange={(e) => setFormData({ ...formData, datePublication: e.target.value })}
              />
            </FormField>

            <FormField label="Date limite de dépôt" required>
              <Input
                type="date"
                value={formData.dateLimite}
                onChange={(e) => setFormData({ ...formData, dateLimite: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Date d'ouverture" required>
              <Input
                type="date"
                value={formData.dateOuverture}
                onChange={(e) => setFormData({ ...formData, dateOuverture: e.target.value })}
                required
              />
            </FormField>
          </div>
        </div>

        <FormField label="Cahier des charges (optionnel)">
          <Textarea
            value={formData.cahierCharges}
            onChange={(e) => setFormData({ ...formData, cahierCharges: e.target.value })}
            rows={6}
            placeholder="Description détaillée, spécifications techniques, conditions..."
          />
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
