'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Input, Select } from '@/components/ui/form-field';
import { zonesApi } from '@/lib/api';
import { Loader2, Settings } from 'lucide-react';

interface ConfigureZonesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Preset {
  key: string;
  name: string;
  description: string;
  levelLabels: Record<string, string>;
}

export function ConfigureZonesModal({ open, onClose, onSuccess }: ConfigureZonesModalProps) {
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({
    '0': '',
    '1': '',
    '2': '',
    '3': '',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les presets
      const presetsRes = await zonesApi.getPresets();
      setPresets(presetsRes.data);

      // Charger la config (avec gestion d'erreur si pas encore créée)
      try {
        const configRes = await zonesApi.getConfig();
        setCurrentConfig(configRes.data);
        setSelectedPreset(configRes.data.preset || 'STANDARD');
        setCustomLabels(configRes.data.levelLabels || {});
      } catch (configError) {
        console.log('Config non trouvée, utilisation des valeurs par défaut');
        // Utiliser les valeurs par défaut (STANDARD)
        setSelectedPreset('STANDARD');
        setCustomLabels({
          '0': 'Pays',
          '1': 'Région',
          '2': 'Département',
          '3': 'Commune',
        });
      }
    } catch (error) {
      console.error('Erreur chargement presets zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);

    // Charger les labels du preset sélectionné
    const presetData = presets.find((p) => p.key === preset);
    if (presetData) {
      setCustomLabels(presetData.levelLabels);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      await zonesApi.updateConfig({
        preset: selectedPreset,
        levelLabels: customLabels,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const selectedPresetData = presets.find((p) => p.key === selectedPreset);

  return (
    <Modal open={open} onClose={onClose} title="Configuration des zones géographiques" size="lg">
      {loading && !currentConfig ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sélection du preset */}
          <FormField label="Modèle de configuration" required>
            <Select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              disabled={loading}
            >
              {presets.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.name}
                </option>
              ))}
            </Select>
            {selectedPresetData && (
              <p className="mt-2 text-xs text-slate-600">
                {selectedPresetData.description}
              </p>
            )}
          </FormField>

          {/* Prévisualisation de la hiérarchie */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-slate-600" />
              <p className="text-sm font-semibold text-slate-900">Hiérarchie configurée</p>
            </div>
            <div className="space-y-1.5">
              {Object.entries(customLabels)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([level, label], index) => (
                  <div key={level} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">Niveau {level}:</span>
                    <span className="font-medium text-slate-900">{label || `Niveau ${level}`}</span>
                    {index < Object.keys(customLabels).length - 1 && (
                      <span className="text-slate-400">→</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Personnalisation des labels */}
          {selectedPreset === 'CUSTOM' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">Personnaliser les niveaux</p>
              {Object.keys(customLabels).map((level) => (
                <FormField key={level} label={`Niveau ${level}`}>
                  <Input
                    value={customLabels[level]}
                    onChange={(e) =>
                      setCustomLabels({ ...customLabels, [level]: e.target.value })
                    }
                    placeholder={`Ex: ${level === '0' ? 'Pays' : level === '1' ? 'Région' : level === '2' ? 'District' : 'Structure'}`}
                  />
                </FormField>
              ))}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Note :</strong> Cette configuration s'applique à toute votre organisation.
              Les zones existantes conservent leur niveau numérique, seul l'affichage change.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
