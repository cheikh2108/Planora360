'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contratsApi, proceduresApi, fournisseursApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

interface CreateContratModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CreateContratModal({ open, onClose, onSuccess }: CreateContratModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    procedureId: '',
    fournisseurId: '',
    montantInitial: '',
    devise: 'XOF',
    dateSignature: '',
    dateEcheance: '',
  });

  const { data: procedures, isLoading: loadingProcedures } = useQuery({
    queryKey: ['procedures-pour-contrat'],
    queryFn: async () => {
      // Récupérer toutes les procédures qui peuvent avoir un contrat
      const res = await proceduresApi.getAll();
      const allProcedures = Array.isArray(res.data) ? res.data : [];
      // Filtrer pour garder seulement celles qui sont éligibles pour un contrat
      return allProcedures.filter((p: any) =>
        ['EN_COURS', 'CLOTUREE_OFFRES', 'EVALUATION', 'ATTRIBUEE'].includes(p.status)
      );
    },
    enabled: open,
  });

  const { data: fournisseurs } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      const res = await fournisseursApi.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      // Trouver la soumission gagnante de la procédure (optionnel)
      const procedure = procedures?.find((p: any) => p.id === data.procedureId);
      const soumissionId = procedure?.contrat?.soumissionId || procedure?.soumissions?.[0]?.id;

      const payload: any = {
        procedureId: data.procedureId,
        fournisseurId: data.fournisseurId,
        montantInitial: parseFloat(data.montantInitial),
        montantPaye: 0,
        devise: data.devise,
        dateSignature: data.dateSignature,
        dateEcheance: data.dateEcheance,
        status: 'SIGNE',
      };

      // Ajouter soumissionId seulement s'il existe
      if (soumissionId) {
        payload.soumissionId = soumissionId;
      }

      return contratsApi.create(payload);
    },
    onSuccess: (res) => {
      success('Contrat créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['contrats'] });
      setFormData({
        procedureId: '',
        fournisseurId: '',
        montantInitial: '',
        devise: 'XOF',
        dateSignature: '',
        dateEcheance: '',
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
    <Modal open={open} onClose={onClose} title="Nouveau Contrat" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Procédure"
          required
        >
          <Select
            value={formData.procedureId}
            onChange={(e) => setFormData({ ...formData, procedureId: e.target.value })}
            required
            disabled={loadingProcedures}
          >
            <option value="">
              {loadingProcedures
                ? 'Chargement...'
                : procedures?.length === 0
                ? 'Aucune procédure éligible'
                : '-- Sélectionner une procédure --'}
            </option>
            {procedures?.map((proc: any) => {
              const statusLabel =
                proc.status === 'ATTRIBUEE' ? 'Attribuée' :
                proc.status === 'CLOTUREE_OFFRES' ? 'Clôturée' :
                proc.status === 'EVALUATION' ? 'Évaluation' :
                proc.status === 'EN_COURS' ? 'En cours' : proc.status;

              return (
                <option key={proc.id} value={proc.id}>
                  [{statusLabel}] {proc.reference} - {proc.objet}
                </option>
              );
            })}
          </Select>
        </FormField>

        {procedures?.length === 0 && !loadingProcedures && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-900">
              ℹ️ <strong>Aucune procédure éligible :</strong> Pour créer un contrat, vous devez d'abord :
              <br />
              1. Avoir une procédure avec le statut <strong>En cours</strong>, <strong>Clôturée</strong>, <strong>Évaluation</strong> ou <strong>Attribuée</strong>
              <br />
              2. Vous pouvez changer le statut d'une procédure depuis sa page de détail
            </p>
          </div>
        )}

        <FormField label="Fournisseur" required>
          <Select
            value={formData.fournisseurId}
            onChange={(e) => setFormData({ ...formData, fournisseurId: e.target.value })}
            required
          >
            <option value="">-- Sélectionner un fournisseur --</option>
            {fournisseurs?.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.raisonSociale}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Montant initial (XOF)" required>
            <Input
              type="number"
              step="0.01"
              value={formData.montantInitial}
              onChange={(e) => setFormData({ ...formData, montantInitial: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Devise" required>
            <Select
              value={formData.devise}
              onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
              required
            >
              <option value="XOF">XOF (Franc CFA)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar)</option>
            </Select>
          </FormField>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Date de signature" required>
            <Input
              type="date"
              value={formData.dateSignature}
              onChange={(e) => setFormData({ ...formData, dateSignature: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Date d'échéance" required>
            <Input
              type="date"
              value={formData.dateEcheance}
              onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
              required
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Création...' : 'Créer le contrat'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
