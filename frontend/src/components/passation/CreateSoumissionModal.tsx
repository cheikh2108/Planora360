'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import api, { soumissionsApi } from '@/lib/api';

interface CreateSoumissionModalProps {
  open: boolean;
  onClose: () => void;
  procedureId: string;
  onSuccess?: () => void;
}

export function CreateSoumissionModal({
  open,
  onClose,
  procedureId,
  onSuccess,
}: CreateSoumissionModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fournisseurId: '',
    numeroDepot: '',
    montantTechnique: '',
    montantFinancier: '',
    montantTotal: '',
    devise: 'XOF',
    conformeAdmin: false,
    conformeTechnique: false,
    conformeFinancier: false,
    horsDelai: false,
  });

  // Récupérer la liste des fournisseurs actifs
  const { data: fournisseurs } = useQuery({
    queryKey: ['fournisseurs', 'actifs'],
    queryFn: async () => {
      const res = await api.get('/passation/fournisseurs', {
        params: { status: 'ACTIF' },
      });
      return res.data;
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        fournisseurId: data.fournisseurId,
        numeroDepot: data.numeroDepot,
        montantFinancier: parseFloat(data.montantFinancier),
        montantTotal: parseFloat(data.montantTotal),
        devise: data.devise,
        conformeAdmin: data.conformeAdmin,
        conformeTechnique: data.conformeTechnique,
        conformeFinancier: data.conformeFinancier,
        horsDelai: data.horsDelai,
        status: 'DEPOSEE',
      };

      // Ajouter montantTechnique seulement s'il est renseigné
      if (data.montantTechnique) {
        (payload as any).montantTechnique = parseFloat(data.montantTechnique);
      }

      const res = await soumissionsApi.create(procedureId, payload);
      return res.data;
    },
    onSuccess: () => {
      success('Soumission créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['procedures', procedureId] });
      queryClient.invalidateQueries({ queryKey: ['soumissions', procedureId] });
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const resetForm = () => {
    setFormData({
      fournisseurId: '',
      numeroDepot: '',
      montantTechnique: '',
      montantFinancier: '',
      montantTotal: '',
      devise: 'XOF',
      conformeAdmin: false,
      conformeTechnique: false,
      conformeFinancier: false,
      horsDelai: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fournisseurId) {
      error('Veuillez sélectionner un fournisseur');
      return;
    }
    if (!formData.numeroDepot) {
      error('Le numéro de dépôt est obligatoire');
      return;
    }
    if (!formData.montantFinancier || !formData.montantTotal) {
      error('Les montants financier et total sont obligatoires');
      return;
    }

    createMutation.mutate(formData);
  };

  const calculateTotal = (technique: string, financier: string) => {
    // Auto-calculer le montant total
    const techValue = parseFloat(technique || '0');
    const finValue = parseFloat(financier || '0');

    if (finValue > 0 || techValue > 0) {
      return (techValue + finValue).toString();
    }
    return '';
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle Soumission"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Saisie manuelle :</strong> Encodez les soumissions reçues
            par email ou en format papier. Assurez-vous de vérifier l'exactitude
            des montants.
          </p>
        </div>

        {/* Fournisseur */}
        <FormField label="Fournisseur" required>
          <Select
            value={formData.fournisseurId}
            onChange={(e) =>
              setFormData({ ...formData, fournisseurId: e.target.value })
            }
            required
          >
            <option value="">-- Sélectionner un fournisseur --</option>
            {fournisseurs?.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.raisonSociale}
                {f.identifiantFiscal && ` (${f.identifiantFiscal})`}
              </option>
            ))}
          </Select>
        </FormField>

        {/* Numéro de dépôt */}
        <FormField
          label="Numéro de dépôt"
          required
        >
          <Input
            value={formData.numeroDepot}
            onChange={(e) =>
              setFormData({ ...formData, numeroDepot: e.target.value })
            }
            placeholder="Ex: SO-2026-001"
            required
          />
        </FormField>

        {/* Montants */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Offres financières
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Montant technique"
            >
              <Input
                type="number"
                step="0.01"
                value={formData.montantTechnique}
                onChange={(e) => {
                  const newTech = e.target.value;
                  const newTotal = calculateTotal(newTech, formData.montantFinancier);
                  setFormData({
                    ...formData,
                    montantTechnique: newTech,
                    montantTotal: newTotal,
                  });
                }}
                placeholder="0"
              />
            </FormField>

            <FormField label="Montant financier" required>
              <Input
                type="number"
                step="0.01"
                value={formData.montantFinancier}
                onChange={(e) => {
                  const newFin = e.target.value;
                  const newTotal = calculateTotal(formData.montantTechnique, newFin);
                  setFormData({
                    ...formData,
                    montantFinancier: newFin,
                    montantTotal: newTotal,
                  });
                }}
                placeholder="0"
                required
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Montant total" required>
              <Input
                type="number"
                step="0.01"
                value={formData.montantTotal}
                onChange={(e) =>
                  setFormData({ ...formData, montantTotal: e.target.value })
                }
                placeholder="0"
                required
              />
            </FormField>

            <FormField label="Devise">
              <Select
                value={formData.devise}
                onChange={(e) =>
                  setFormData({ ...formData, devise: e.target.value })
                }
              >
                <option value="XOF">XOF (Franc CFA)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dollar)</option>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Conformités */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Conformités
          </h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.conformeAdmin}
              onChange={(e) =>
                setFormData({ ...formData, conformeAdmin: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">
              Conforme administrativement (documents complets)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.conformeTechnique}
              onChange={(e) =>
                setFormData({ ...formData, conformeTechnique: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">
              Conforme techniquement (spécifications respectées)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.conformeFinancier}
              onChange={(e) =>
                setFormData({ ...formData, conformeFinancier: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">
              Conforme financièrement (garanties, cautions)
            </span>
          </label>
        </div>

        {/* Hors délai */}
        <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50">
          <input
            type="checkbox"
            checked={formData.horsDelai}
            onChange={(e) =>
              setFormData({ ...formData, horsDelai: e.target.checked })
            }
            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
          />
          <div>
            <span className="text-sm font-medium text-slate-900">
              Soumission hors délai
            </span>
            <p className="text-xs text-slate-500">
              Cocher si reçue après la date limite
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Création...' : 'Créer la soumission'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
