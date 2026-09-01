'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proceduresApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Select } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import type { StatusProcedure } from '@/lib/types-passation';

interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  procedureId: string;
  currentStatus: StatusProcedure;
}

const STATUS_OPTIONS: { value: StatusProcedure; label: string }[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'PUBLIEE', label: 'Publiée' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'CLOTUREE_OFFRES', label: 'Clôturée (offres)' },
  { value: 'EVALUATION', label: 'Évaluation' },
  { value: 'ATTRIBUEE', label: 'Attribuée' },
  { value: 'INFRUCTUEUSE', label: 'Infructueuse' },
  { value: 'ANNULEE', label: 'Annulée' },
];

export function ChangeStatusModal({
  open,
  onClose,
  procedureId,
  currentStatus,
}: ChangeStatusModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<StatusProcedure>(currentStatus);

  const changeMutation = useMutation({
    mutationFn: async (status: StatusProcedure) => {
      return proceduresApi.update(procedureId, { status });
    },
    onSuccess: () => {
      success('Statut modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['procedures', procedureId] });
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      onClose();
    },
    onError: (err: any) => {
      error(err.message || 'Erreur lors du changement de statut');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === currentStatus) {
      error('Veuillez sélectionner un nouveau statut');
      return;
    }
    changeMutation.mutate(newStatus);
  };

  return (
    <Modal open={open} onClose={onClose} title="Changer le statut" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-900">
            ⚠️ <strong>Attention :</strong> Changez le statut uniquement si nécessaire.
            Certains changements peuvent affecter le workflow.
          </p>
        </div>

        <FormField label="Statut actuel">
          <div className="px-4 py-3 bg-slate-100 rounded-xl text-slate-700 font-medium">
            {STATUS_OPTIONS.find((s) => s.value === currentStatus)?.label}
          </div>
        </FormField>

        <FormField label="Nouveau statut" required>
          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as StatusProcedure)}
            required
          >
            {STATUS_OPTIONS.map((status) => (
              <option
                key={status.value}
                value={status.value}
                disabled={status.value === currentStatus}
              >
                {status.label}
                {status.value === currentStatus && ' (actuel)'}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={changeMutation.isPending}>
            {changeMutation.isPending ? 'Modification...' : 'Changer le statut'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
