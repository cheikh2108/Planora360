'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  FileText,
  ShoppingCart,
  Users,
  Gavel,
  FileSignature,
  BarChart3,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  ppmApi,
  demandesApi,
  fournisseursApi,
  proceduresApi,
  contratsApi,
} from '@/lib/api';

interface ModuleCard {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  stats?: { label: string; value: number | string }[];
}

export default function PassationHomePage() {
  const router = useRouter();

  // Fetch stats for dashboard
  const { data: ppmStats } = useQuery({
    queryKey: ['ppm', 'stats'],
    queryFn: async () => {
      const res = await ppmApi.getAll({ year: new Date().getFullYear() });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: demandesStats } = useQuery({
    queryKey: ['demandes', 'stats'],
    queryFn: async () => {
      const res = await demandesApi.getAll();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: fournisseursStats } = useQuery({
    queryKey: ['fournisseurs', 'stats'],
    queryFn: async () => {
      const res = await fournisseursApi.getAll({ status: 'ACTIF' });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: proceduresStats } = useQuery({
    queryKey: ['procedures', 'stats'],
    queryFn: async () => {
      const res = await proceduresApi.getAll({ status: 'EN_COURS' });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: contratsStats } = useQuery({
    queryKey: ['contrats', 'stats'],
    queryFn: async () => {
      const res = await contratsApi.getAll({ status: 'EN_COURS' });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const modules: ModuleCard[] = [
    {
      title: 'Plans de Passation (PPM)',
      description: 'Planification annuelle des marchés publics',
      icon: FileText,
      href: '/passation/ppm',
      color: 'blue',
      stats: [
        { label: 'Plans validés', value: ppmStats?.filter((p: any) => p.status === 'VALIDE').length || 0 },
      ],
    },
    {
      title: 'Demandes d\'Achat',
      description: 'Gestion des demandes et workflows de validation',
      icon: ShoppingCart,
      href: '/passation/demandes',
      color: 'purple',
      stats: [
        { label: 'En attente', value: demandesStats?.filter((d: any) => d.status.includes('VALIDATION')).length || 0 },
      ],
    },
    {
      title: 'Fournisseurs',
      description: 'Référentiel et évaluation des fournisseurs',
      icon: Users,
      href: '/passation/fournisseurs',
      color: 'green',
      stats: [
        { label: 'Actifs', value: fournisseursStats?.length || 0 },
      ],
    },
    {
      title: 'Procédures',
      description: 'Appels d\'offres et consultations',
      icon: Gavel,
      href: '/passation/procedures',
      color: 'amber',
      stats: [
        { label: 'En cours', value: proceduresStats?.length || 0 },
      ],
    },
    {
      title: 'Contrats',
      description: 'Suivi des contrats et exécution',
      icon: FileSignature,
      href: '/passation/contrats',
      color: 'cyan',
      stats: [
        { label: 'En exécution', value: contratsStats?.length || 0 },
      ],
    },
    {
      title: 'Tableau de Bord',
      description: 'Vue d\'ensemble et indicateurs clés',
      icon: BarChart3,
      href: '/passation/dashboard',
      color: 'indigo',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Passation de Marchés"
        subtitle="Gestion complète du cycle de passation des marchés publics"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Plans PPM</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {ppmStats?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Demandes</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {demandesStats?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-purple-50 p-3">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Procédures</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {proceduresStats?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-amber-50 p-3">
                <Gavel className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Contrats</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {contratsStats?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-cyan-50 p-3">
                <FileSignature className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const colorClass = colorClasses[module.color as keyof typeof colorClasses];

            return (
              <button
                key={module.href}
                onClick={() => router.push(module.href)}
                className="group rounded-lg bg-white p-6 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className={`inline-flex rounded-lg p-3 ${colorClass} transition-colors`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                  {module.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{module.description}</p>
                {module.stats && module.stats.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    {module.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
