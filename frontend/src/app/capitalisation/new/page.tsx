'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import api from '@/lib/api';

export default function NewCapitalisationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'BONNE_PRATIQUE',
    title: '',
    context: '',
    challenges: '',
    solutions: '',
    results: '',
    lessons: '',
    tags: '',
    status: 'BROUILLON',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const response = await api.post('/capitalization', payload);
      router.push(`/capitalisation/${response.data.id}`);
    } catch (error) {
      console.error('Erreur création fiche:', error);
      alert('Erreur lors de la création de la fiche');
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
          <h1 className="text-3xl font-bold">Nouvelle fiche de capitalisation</h1>
          <p className="text-muted-foreground mt-1">
            Documentez vos bonnes pratiques et enseignements
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BONNE_PRATIQUE">Bonne pratique</SelectItem>
                    <SelectItem value="RECIT_CHANGEMENT">Récit de changement</SelectItem>
                    <SelectItem value="GUIDE">Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BROUILLON">Brouillon</SelectItem>
                    <SelectItem value="PUBLIE">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Contexte *</Label>
              <Textarea
                id="context"
                required
                rows={4}
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Défis et contraintes *</Label>
              <Textarea
                id="challenges"
                required
                rows={4}
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solutions">Solutions mises en œuvre *</Label>
              <Textarea
                id="solutions"
                required
                rows={4}
                value={formData.solutions}
                onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="results">Résultats obtenus *</Label>
              <Textarea
                id="results"
                required
                rows={4}
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessons">Leçons apprises *</Label>
              <Textarea
                id="lessons"
                required
                rows={4}
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                placeholder="Ex: santé, communication, sensibilisation"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
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
