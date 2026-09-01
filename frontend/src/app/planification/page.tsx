'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, FileText, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function PlanificationPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get('/planning/annual-work-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Erreur chargement PTA:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Planification"
        subtitle="Plans de Travail Annuels et Matrice de résultats"
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/planification/results-matrix')}>
              <FileSpreadsheet size={14} className="mr-1.5" />
              Matrice
            </Button>
            <Button onClick={() => router.push('/planification/new')}>
              <Plus size={14} className="mr-1.5" />
              Nouveau PTA
            </Button>
          </>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            illustration="data"
            title="Aucun Plan de Travail Annuel"
            description="Créez votre premier PTA avec vos objectifs stratégiques"
            action={{
              label: 'Créer un PTA',
              onClick: () => router.push('/planification/new'),
              leftIcon: <Plus size={14} />
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/planification/${plan.id}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-[#2563eb]/30 transition-all flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0f1e38] flex items-center justify-center shrink-0">
                        <Calendar size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {plan.year}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                      plan.status === 'VALIDE' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {plan.status === 'VALIDE' && <CheckCircle2 size={10} />}
                      {plan.status === 'VALIDE' ? 'Validé' : 'Brouillon'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug -mt-2">
                    {plan.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} className="text-slate-600" />
                      Créé le {new Date(plan.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    {plan.validatedAt && (
                      <div className="flex items-center gap-1.5 text-teal-600">
                        <CheckCircle2 size={10} />
                        Validé le {new Date(plan.validatedAt).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
