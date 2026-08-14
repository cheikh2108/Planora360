'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Info } from 'lucide-react';
import api from '@/lib/api';

export default function ResultsMatrixPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrix, setMatrix] = useState<any>(null);
  const [data, setData] = useState('{}');

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      const response = await api.get('/planning/results-matrix');
      setMatrix(response.data);
      setData(JSON.stringify(response.data.data, null, 2));
    } catch (error) {
      console.error('Erreur chargement matrice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let dataJson;
      try {
        dataJson = JSON.parse(data);
      } catch {
        alert('Format JSON invalide');
        setSaving(false);
        return;
      }

      await api.patch('/planning/results-matrix', { data: dataJson });
      alert('Matrice enregistrée avec succès');
      await loadMatrix();
    } catch (error) {
      console.error('Erreur sauvegarde matrice:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <Header title="Chargement..." subtitle="Matrice de Résultats" />
        <main className="flex-1 px-4 md:px-6 py-6">
          <div className="text-center text-slate-500">Chargement...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Matrice de Résultats"
        subtitle="Objectifs → Résultats → Indicateurs"
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            Retour
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="max-w-4xl space-y-5">
          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Structure attendue :</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Chaque objectif contient un titre et une liste de résultats</li>
                <li>Chaque résultat contient un titre et une liste d'indicateurs</li>
                <li>Chaque indicateur : nom, cible, atteint (valeur actuelle)</li>
              </ul>
            </div>
          </div>

          {/* Éditeur */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                Données de la matrice (format JSON)
              </label>
              <Textarea
                rows={20}
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="font-mono text-sm"
                placeholder={`{
  "objectif1": {
    "titre": "Améliorer la santé communautaire",
    "resultats": [
      {
        "titre": "Résultat 1",
        "indicateurs": [
          {"nom": "Taux de...", "cible": 80, "atteint": 0}
        ]
      }
    ]
  }
}`}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving}>
                <Save size={14} className="mr-1.5" />
                Enregistrer
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

