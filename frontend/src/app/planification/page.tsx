'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, CalendarIcon, CheckCircle2Icon, FileTextIcon } from 'lucide-react';
import api from '@/lib/api';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planification</h1>
          <p className="text-muted-foreground mt-1">
            Plans de Travail Annuels et Matrice de résultats
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push('/planification/results-matrix')}>
            <FileTextIcon className="w-4 h-4 mr-2" />
            Matrice de résultats
          </Button>
          <Button onClick={() => router.push('/planification/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouveau PTA
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Chargement...</p>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun Plan de Travail Annuel</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier PTA
            </p>
            <Button onClick={() => router.push('/planification/new')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Créer un PTA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/planification/${plan.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {plan.year}
                  </Badge>
                  <Badge variant={plan.status === 'VALIDE' ? 'default' : 'outline'}>
                    {plan.status === 'VALIDE' ? (
                      <>
                        <CheckCircle2Icon className="w-3 h-3 mr-1" />
                        Validé
                      </>
                    ) : (
                      'Brouillon'
                    )}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{plan.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Créé le {new Date(plan.createdAt).toLocaleDateString('fr-FR')}
                </div>
                {plan.validatedAt && (
                  <div className="text-sm text-green-600 mt-2">
                    Validé le {new Date(plan.validatedAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
