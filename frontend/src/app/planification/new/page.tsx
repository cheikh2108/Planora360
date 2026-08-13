'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import api from '@/lib/api';

export default function NewPlanificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: '',
    objectives: '{}',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let objectivesJson;
      try {
        objectivesJson = JSON.parse(formData.objectives);
      } catch {
        alert('Format JSON invalide pour les objectifs');
        setLoading(false);
        return;
      }

      const response = await api.post('/planning/annual-work-plans', {
        ...formData,
        objectives: objectivesJson,
      });

      router.push(`/planification/${response.data.id}`);
    } catch (error) {
      console.error('Erreur création PTA:', error);
      alert('Erreur lors de la création du PTA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-8 h-8 p-0">
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouveau Plan de Travail Annuel</h1>
          <p className="text-muted-foreground mt-1">
            Créez votre PTA avec vos objectifs stratégiques
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du PTA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Année *</Label>
                <Input
                  id="year"
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                required
                placeholder="Ex: Plan de Travail Annuel 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Objectifs (format JSON) *</Label>
              <Textarea
                id="objectives"
                required
                rows={12}
                placeholder={`{
  "objectif1": {
    "titre": "Améliorer la santé maternelle",
    "resultats": ["Résultat 1", "Résultat 2"],
    "indicateurs": [
      {"nom": "Taux de...", "cible": 80}
    ]
  }
}`}
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Entrez vos objectifs au format JSON. Validez que la syntaxe est correcte avant de soumettre.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                <SaveIcon className="w-4 h-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
