'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-8 h-8 p-0">
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Matrice de Résultats</h1>
          <p className="text-muted-foreground mt-1">
            Objectifs → Résultats → Indicateurs
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Éditeur de matrice</CardTitle>
          <CardDescription>
            Modifiez votre matrice de résultats au format JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <SaveIcon className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Retour
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Structure attendue :</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Chaque objectif contient un titre et une liste de résultats</li>
              <li>Chaque résultat contient un titre et une liste d'indicateurs</li>
              <li>Chaque indicateur contient : nom, cible, atteint (valeur actuelle)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
