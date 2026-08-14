'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Target, TrendingUp, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [params.id]);

  const loadPlan = async () => {
    try {
      const response = await api.get(`/planning/annual-work-plans/${params.id}`);
      setPlan(response.data);
    } catch (error) {
      console.error('Erreur chargement PTA:', error);
      alert('PTA introuvable');
      router.push('/planification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce PTA ?')) return;

    try {
      await api.delete(`/planning/annual-work-plans/${params.id}`);
      router.push('/planification');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleValidate = async () => {
    try {
      await api.patch(`/planning/annual-work-plans/${params.id}/validate`);
      await loadPlan();
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <Header title="Chargement..." subtitle="Plan de Travail Annuel" />
        <main className="flex-1 px-4 md:px-6 py-6">
          <div className="text-center text-slate-500">Chargement...</div>
        </main>
      </div>
    );
  }

  if (!plan) return null;

  const objectifs = Object.entries(plan.objectives || {}).map(([key, value]: [string, any]) => ({
    key,
    ...value,
  }));

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title={plan.title}
        subtitle={`Plan de Travail Annuel ${plan.year}`}
        actions={
          <>
            {plan.status === 'BROUILLON' && (
              <Button onClick={handleValidate}>
                <CheckCircle2 size={14} className="mr-1.5" />
                Valider
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push('/planification')}>
              Retour
            </Button>
          </>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* Infos générales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0f1e38] flex items-center justify-center">
                  <Calendar size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Statut</p>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                    plan.status === 'VALIDE' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {plan.status === 'VALIDE' ? 'Validé' : 'Brouillon'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Créé le</p>
                  <p className="font-medium text-slate-900">
                    {new Date(plan.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {plan.validatedAt && (
                  <div>
                    <p className="text-slate-500">Validé le</p>
                    <p className="font-medium text-teal-600">
                      {new Date(plan.validatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {plan.status === 'BROUILLON' && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600">
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Objectifs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Target size={16} className="text-[#2563eb]" />
            Objectifs stratégiques ({objectifs.length})
          </h3>

          {objectifs.map((obj, index) => (
            <div key={obj.key} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Objectif {index + 1}
                </h4>
                <p className="text-slate-700">{obj.titre}</p>
              </div>

              {/* Résultats attendus */}
              {obj.resultats && obj.resultats.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} className="text-green-600" />
                    Résultats attendus
                  </h5>
                  <ul className="space-y-1.5">
                    {obj.resultats.map((res: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {res}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Indicateurs */}
              {obj.indicateurs && obj.indicateurs.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                    <TrendingUp size={14} className="text-indigo-600" />
                    Indicateurs de mesure
                  </h5>
                  <div className="space-y-2">
                    {obj.indicateurs.map((ind: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <span className="text-sm text-slate-700">{ind.nom}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            Cible : {ind.cible}
                          </span>
                          {ind.unite && (
                            <span className="text-xs text-slate-500">{ind.unite}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
