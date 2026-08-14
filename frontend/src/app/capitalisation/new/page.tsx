'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
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
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Nouvelle fiche de capitalisation"
        subtitle="Documentez vos bonnes pratiques et enseignements"
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6">
        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium text-slate-900">
                  Type *
                </label>
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
                <label htmlFor="status" className="text-sm font-medium text-slate-900">
                  Statut *
                </label>
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
              <label htmlFor="title" className="text-sm font-medium text-slate-900">
                Titre *
              </label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Stratégie de communication efficace"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium text-slate-900">
                Contexte *
              </label>
              <Textarea
                id="context"
                required
                rows={4}
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="Décrivez le contexte dans lequel cette pratique a été mise en œuvre"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="challenges" className="text-sm font-medium text-slate-900">
                Défis et contraintes *
              </label>
              <Textarea
                id="challenges"
                required
                rows={4}
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                placeholder="Quels défis avez-vous rencontrés ?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="solutions" className="text-sm font-medium text-slate-900">
                Solutions mises en œuvre *
              </label>
              <Textarea
                id="solutions"
                required
                rows={4}
                value={formData.solutions}
                onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
                placeholder="Quelles solutions avez-vous appliquées ?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="results" className="text-sm font-medium text-slate-900">
                Résultats obtenus *
              </label>
              <Textarea
                id="results"
                required
                rows={4}
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                placeholder="Quels résultats ont été atteints ?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lessons" className="text-sm font-medium text-slate-900">
                Leçons apprises *
              </label>
              <Textarea
                id="lessons"
                required
                rows={4}
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                placeholder="Quelles leçons en tirez-vous ?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium text-slate-900">
                Tags (séparés par des virgules)
              </label>
              <Input
                id="tags"
                placeholder="Ex: santé, communication, sensibilisation"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading}>
                <Save size={14} className="mr-1.5" />
                Enregistrer
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
