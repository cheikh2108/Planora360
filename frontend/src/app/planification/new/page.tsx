'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Trash2, Target, CheckCircle, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

type Indicateur = {
  nom: string;
  cible: number;
  unite: string;
};

type Objectif = {
  titre: string;
  resultats: string[];
  indicateurs: Indicateur[];
};

export default function NewPlanificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [title, setTitle] = useState('');
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);

  const ajouterObjectif = () => {
    setObjectifs([...objectifs, { titre: '', resultats: [''], indicateurs: [{ nom: '', cible: 0, unite: '' }] }]);
  };

  const supprimerObjectif = (index: number) => {
    setObjectifs(objectifs.filter((_, i) => i !== index));
  };

  const updateObjectif = (index: number, field: keyof Objectif, value: any) => {
    const newObjectifs = [...objectifs];
    newObjectifs[index] = { ...newObjectifs[index], [field]: value };
    setObjectifs(newObjectifs);
  };

  const ajouterResultat = (objIndex: number) => {
    const newObjectifs = [...objectifs];
    newObjectifs[objIndex].resultats.push('');
    setObjectifs(newObjectifs);
  };

  const supprimerResultat = (objIndex: number, resIndex: number) => {
    const newObjectifs = [...objectifs];
    newObjectifs[objIndex].resultats = newObjectifs[objIndex].resultats.filter((_, i) => i !== resIndex);
    setObjectifs(newObjectifs);
  };

  const updateResultat = (objIndex: number, resIndex: number, value: string) => {
    const newObjectifs = [...objectifs];
    newObjectifs[objIndex].resultats[resIndex] = value;
    setObjectifs(newObjectifs);
  };

  const ajouterIndicateur = (objIndex: number) => {
    const newObjectifs = [...objectifs];
    newObjectifs[objIndex].indicateurs.push({ nom: '', cible: 0, unite: '' });
    setObjectifs(newObjectifs);
  };

  const supprimerIndicateur = (objIndex: number, indIndex: number) => {
    const newObjectifs = [...objectifs];
    newObjectifs[objIndex].indicateurs = newObjectifs[objIndex].indicateurs.filter((_, i) => i !== indIndex);
    setObjectifs(newObjectifs);
  };

  const updateIndicateur = (objIndex: number, indIndex: number, field: keyof Indicateur, value: any) => {
    const newObjectifs = [...objectifs];
    newObjectifs[objIndex].indicateurs[indIndex] = {
      ...newObjectifs[objIndex].indicateurs[indIndex],
      [field]: value,
    };
    setObjectifs(newObjectifs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transformer en JSON pour l'API
      const objectivesJson = objectifs.reduce((acc, obj, index) => {
        acc[`objectif${index + 1}`] = {
          titre: obj.titre,
          resultats: obj.resultats.filter(r => r.trim()),
          indicateurs: obj.indicateurs.filter(ind => ind.nom.trim()),
        };
        return acc;
      }, {} as Record<string, any>);

      const response = await api.post('/planning/annual-work-plans', {
        year,
        title,
        objectives: objectivesJson,
      });

      router.push(`/planification/${response.data.id}`);
    } catch (error: any) {
      console.error('Erreur création PTA:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors de la création du PTA: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Nouveau Plan de Travail Annuel"
        subtitle="Créez votre PTA avec vos objectifs stratégiques"
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6">
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
          {/* Infos générales */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium text-slate-900">
                  Année *
                </label>
                <Input
                  id="year"
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-900">
                Titre du plan *
              </label>
              <Input
                id="title"
                required
                placeholder="Ex: Plan de Travail Annuel 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Objectifs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Target size={16} className="text-[#2563eb]" />
                Objectifs stratégiques
              </h3>
              <Button type="button" variant="secondary" size="sm" onClick={ajouterObjectif}>
                <Plus size={14} className="mr-1.5" />
                Ajouter un objectif
              </Button>
            </div>

            {objectifs.length === 0 && (
              <div className="bg-slate-50 rounded-xl p-6 text-center text-sm text-slate-500">
                Aucun objectif ajouté. Cliquez sur "Ajouter un objectif" pour commencer.
              </div>
            )}

            {objectifs.map((obj, objIndex) => (
              <div key={objIndex} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-slate-900">
                      Objectif {objIndex + 1} *
                    </label>
                    <Input
                      required
                      placeholder="Ex: Réduire la mortalité maternelle de 30%"
                      value={obj.titre}
                      onChange={(e) => updateObjectif(objIndex, 'titre', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => supprimerObjectif(objIndex)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                {/* Résultats attendus */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-green-600" />
                      Résultats attendus
                    </label>
                    <button
                      type="button"
                      onClick={() => ajouterResultat(objIndex)}
                      className="text-xs text-[#2563eb] hover:underline"
                    >
                      + Ajouter
                    </button>
                  </div>
                  {obj.resultats.map((res, resIndex) => (
                    <div key={resIndex} className="flex gap-2">
                      <Input
                        placeholder="Ex: 80% des femmes accouchent en structure sanitaire"
                        value={res}
                        onChange={(e) => updateResultat(objIndex, resIndex, e.target.value)}
                        className="flex-1"
                      />
                      {obj.resultats.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => supprimerResultat(objIndex, resIndex)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Indicateurs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-indigo-600" />
                      Indicateurs de mesure
                    </label>
                    <button
                      type="button"
                      onClick={() => ajouterIndicateur(objIndex)}
                      className="text-xs text-[#2563eb] hover:underline"
                    >
                      + Ajouter
                    </button>
                  </div>
                  {obj.indicateurs.map((ind, indIndex) => (
                    <div key={indIndex} className="flex gap-2 items-start">
                      <Input
                        placeholder="Nom de l'indicateur"
                        value={ind.nom}
                        onChange={(e) => updateIndicateur(objIndex, indIndex, 'nom', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Cible"
                        value={ind.cible || ''}
                        onChange={(e) => updateIndicateur(objIndex, indIndex, 'cible', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                      <Input
                        placeholder="Unité"
                        value={ind.unite}
                        onChange={(e) => updateIndicateur(objIndex, indIndex, 'unite', e.target.value)}
                        className="w-20"
                      />
                      {obj.indicateurs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => supprimerIndicateur(objIndex, indIndex)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" isLoading={loading} disabled={objectifs.length === 0 || !title}>
              <Save size={14} className="mr-1.5" />
              Enregistrer le PTA
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
