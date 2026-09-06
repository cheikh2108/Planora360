'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FormField, Select } from '@/components/ui/form-field';
import { activitiesApi, plansApi } from '@/lib/api';
import { Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ImportActivitiesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  planId?: string; // Si fourni, le sélecteur de plan est masqué
}

export function ImportActivitiesModal({ open, onClose, onSuccess, planId: initialPlanId }: ImportActivitiesModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [planId, setPlanId] = useState(initialPlanId || '');
  const [result, setResult] = useState<any>(null);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await plansApi.list();
      return response.data.data; // L'API retourne { data, total, page, limit }
    },
    enabled: open && !initialPlanId, // Pas besoin de charger si planId est fourni
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validation du type de fichier côté client
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/csv',
      ];

      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

      if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
        setResult({
          success: 0,
          errors: 1,
          total: 0,
          errorDetails: [{
            line: 0,
            error: 'Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV (.csv).',
          }],
        });
        return;
      }

      // Vérifier la taille (10 MB max)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setResult({
          success: 0,
          errors: 1,
          total: 0,
          errorDetails: [{
            line: 0,
            error: 'Fichier trop volumineux. La taille maximale est de 10 MB.',
          }],
        });
        return;
      }

      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !planId) return;

    try {
      setLoading(true);
      const response = await activitiesApi.import(file, planId);
      setResult(response.data);

      if (response.data.success > 0 && onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'importation';
      setResult({
        success: 0,
        errors: 1,
        total: 0,
        errorDetails: [{ line: 0, error: message }],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPlanId(initialPlanId || ''); // Remet le planId initial si fourni
    setResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = `Titre,Description,Résultats attendus,Axe,Responsable,Date début,Date fin,Priorité,Budget planifié,Zones
Formation agents de santé,Formation continue pour 50 agents,Améliorer les compétences cliniques,Santé,responsable@email.com,2026-01-15,2026-03-30,ELEVEE,5000000,DK
Construction école primaire,Construire 3 salles de classe,100 élèves supplémentaires scolarisés,Éducation,chef@email.com,2026-02-01,2026-12-31,CRITIQUE,25000000,"TH,SL"`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modele_import_activites.csv';
    link.click();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Importer des activités depuis Excel" size="lg">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan d'action - masqué si planId est fourni */}
          {!initialPlanId && (
            <FormField label="Plan d'action" required>
              <Select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Sélectionnez un plan</option>
                {plans?.map((plan: any) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
              </Select>
              <p className="mt-2 text-xs text-slate-600">
                Les activités seront importées dans ce plan d'action
              </p>
            </FormField>
          )}

          {/* Upload fichier */}
          <div>
            <label className="block text-xs font-medium mb-2 text-slate-900">
              Fichier Excel <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet size={32} className="text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-900">
                    Cliquez pour sélectionner un fichier
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Excel (.xlsx, .xls) ou CSV - Maximum 10 MB
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Format attendu */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Format Excel attendu :</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• <strong>Titre</strong> (obligatoire)</p>
              <p>• <strong>Description</strong></p>
              <p>• <strong>Résultats attendus</strong></p>
              <p>• <strong>Axe</strong> (nom de l'axe - obligatoire)</p>
              <p>• <strong>Responsable</strong> (email - obligatoire)</p>
              <p>• <strong>Date début</strong> (YYYY-MM-DD - obligatoire)</p>
              <p>• <strong>Date fin</strong> (YYYY-MM-DD - obligatoire)</p>
              <p>• <strong>Priorité</strong> (FAIBLE/MOYENNE/ELEVEE/CRITIQUE)</p>
              <p>• <strong>Budget planifié</strong> (nombre)</p>
              <p>• <strong>Zones</strong> (codes séparés par virgules, ex: "DK,TH")</p>
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              <Download size={16} />
              Télécharger un modèle
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={!file || !planId || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importation...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* Résultats de l'import */
        <div className="space-y-6">
          {/* Résumé */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{result.total}</p>
              <p className="text-xs text-slate-600 mt-1">Lignes traitées</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{result.success}</p>
              <p className="text-xs text-green-700 mt-1">Importées</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{result.errors}</p>
              <p className="text-xs text-red-700 mt-1">Erreurs</p>
            </div>
          </div>

          {/* Message de succès */}
          {result.success > 0 && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">
                  {result.success} activité{result.success > 1 ? 's' : ''} importée{result.success > 1 ? 's' : ''} avec succès !
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Les activités sont maintenant disponibles dans le plan d'action sélectionné.
                </p>
              </div>
            </div>
          )}

          {/* Erreurs détaillées */}
          {result.errors > 0 && result.errorDetails && result.errorDetails.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm font-semibold text-red-900">
                  {result.errors} erreur{result.errors > 1 ? 's' : ''} détectée{result.errors > 1 ? 's' : ''} :
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg max-h-60 overflow-y-auto">
                {result.errorDetails.map((error: any, idx: number) => (
                  <div key={idx} className="px-4 py-2 border-b border-red-100 last:border-0">
                    <p className="text-xs text-red-900">
                      {error.line > 0 ? (
                        <><strong>Ligne {error.line}:</strong> {error.error}</>
                      ) : (
                        <><strong>Erreur:</strong> {error.error}</>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button onClick={handleClose}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
