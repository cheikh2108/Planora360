'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fournisseursApi } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Textarea } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';

interface CreateFournisseurModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function CreateFournisseurModal({ open, onClose, onSuccess }: CreateFournisseurModalProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    raisonSociale: '',
    identifiantFiscal: '',
    registreCommerce: '',
    adresse: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    nomContact: '',
    domainesActivite: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      // Construire payload en omettant les champs vides
      const payload: any = {
        raisonSociale: data.raisonSociale,
      };
      if (data.identifiantFiscal) payload.identifiantFiscal = data.identifiantFiscal;
      if (data.registreCommerce) payload.registreCommerce = data.registreCommerce;
      if (data.adresse) payload.adresse = data.adresse;
      if (data.ville) payload.ville = data.ville;
      if (data.pays) payload.pays = data.pays;
      if (data.telephone) payload.telephone = data.telephone;
      if (data.email) payload.email = data.email;
      if (data.nomContact) payload.nomContact = data.nomContact;
      return fournisseursApi.create(payload);
    },
    onSuccess: (res) => {
      success('Fournisseur créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      setFormData({
        raisonSociale: '',
        identifiantFiscal: '',
        registreCommerce: '',
        adresse: '',
        ville: '',
        pays: '',
        telephone: '',
        email: '',
        nomContact: '',
        domainesActivite: [],
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
    <Modal open={open} onClose={onClose} title="Nouveau Fournisseur" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Raison sociale" required>
            <Input
              value={formData.raisonSociale}
              onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Identifiant fiscal">
            <Input
              value={formData.identifiantFiscal}
              onChange={(e) => setFormData({ ...formData, identifiantFiscal: e.target.value })}
            />
          </FormField>

          <FormField label="Registre de commerce">
            <Input
              value={formData.registreCommerce}
              onChange={(e) => setFormData({ ...formData, registreCommerce: e.target.value })}
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <FormField label="Téléphone">
            <Input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
          </FormField>

          <FormField label="Nom du contact">
            <Input
              value={formData.nomContact}
              onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })}
            />
          </FormField>

          <FormField label="Ville">
            <Input
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            />
          </FormField>

          <FormField label="Pays">
            <Input
              value={formData.pays}
              onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Adresse">
          <Textarea
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            rows={3}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Création...' : 'Créer le fournisseur'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
