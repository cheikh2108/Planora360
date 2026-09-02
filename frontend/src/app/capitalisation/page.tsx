'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Plus, Search, BookOpen, Lightbulb, FileText, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';

const TYPE_META: Record<string, { label: string; icon: typeof Lightbulb; color: string; bg: string }> = {
  BONNE_PRATIQUE: { label: 'Bonne pratique', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
  RECIT_CHANGEMENT: { label: 'Récit de changement', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  GUIDE: { label: 'Guide', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
};

const TYPE_FILTERS = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Bonnes pratiques', value: 'BONNE_PRATIQUE' },
  { label: 'Récits', value: 'RECIT_CHANGEMENT' },
  { label: 'Guides', value: 'GUIDE' },
];

const STATUS_FILTERS = [
  { label: 'Tous', value: 'ALL' },
  { label: 'Publiés', value: 'PUBLIE' },
  { label: 'Brouillons', value: 'BROUILLON' },
];

export default function CapitalisationPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await api.get('/capitalization');
      setRecords(response.data);
    } catch (error) {
      console.error('Erreur chargement fiches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchSearch = record.title.toLowerCase().includes(search.toLowerCase()) ||
      record.context.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === 'ALL' || record.type === selectedType;
    const matchStatus = selectedStatus === 'ALL' || record.status === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: records.length,
    publie: records.filter(r => r.status === 'PUBLIE').length,
    brouillon: records.filter(r => r.status === 'BROUILLON').length,
    bonnePratique: records.filter(r => r.type === 'BONNE_PRATIQUE').length,
    recit: records.filter(r => r.type === 'RECIT_CHANGEMENT').length,
    guide: records.filter(r => r.type === 'GUIDE').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Capitalisation"
          subtitle="Bibliothèque de savoirs et bonnes pratiques"
        />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Capitalisation"
        subtitle={`${stats.total} fiche${stats.total > 1 ? 's' : ''} de capitalisation`}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => router.push('/capitalisation/new')}
          >
            Nouvelle fiche
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* KPI Cards */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white', icon: BookOpen },
              { label: 'Publiées', value: stats.publie, color: 'text-green-600', bg: 'bg-green-50', icon: BookOpen },
              { label: 'Brouillons', value: stats.brouillon, color: 'text-slate-600', bg: 'bg-slate-50', icon: FileText },
              { label: 'Bonnes pratiques', value: stats.bonnePratique, color: 'text-amber-600', bg: 'bg-amber-50', icon: Lightbulb },
              { label: 'Récits', value: stats.recit, color: 'text-blue-600', bg: 'bg-blue-50', icon: BookOpen },
              { label: 'Guides', value: stats.guide, color: 'text-purple-600', bg: 'bg-purple-50', icon: FileText },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={cn('rounded-2xl border border-slate-200 p-4 flex flex-col gap-2', stat.bg)}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{stat.label}</p>
                    <Icon size={14} className="text-slate-600" />
                  </div>
                  <p className={cn('text-2xl md:text-3xl font-bold tabular-nums', stat.color)}>{stat.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-slate-600" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Filtres</p>
          </div>

          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                placeholder="Rechercher par titre, contexte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-600 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1.5">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedType(filter.value)}
                      className={cn(
                        'px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                        selectedType === filter.value
                          ? 'bg-[#0f1e38] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-900 mb-1.5">Statut</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedStatus(filter.value)}
                      className={cn(
                        'px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                        selectedStatus === filter.value
                          ? 'bg-[#0f1e38] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <BookOpen className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              {search || selectedType !== 'ALL' || selectedStatus !== 'ALL'
                ? 'Aucune fiche ne correspond'
                : 'Aucune fiche de capitalisation'}
            </h3>
            <p className="mb-6 text-sm text-slate-600">
              {search || selectedType !== 'ALL' || selectedStatus !== 'ALL'
                ? 'Essayez de modifier vos filtres ou votre recherche.'
                : 'Commencez par documenter vos bonnes pratiques et enseignements.'}
            </p>
            {!search && selectedType === 'ALL' && selectedStatus === 'ALL' && (
              <Button
                icon={<Plus size={16} />}
                onClick={() => router.push('/capitalisation/new')}
              >
                Créer une fiche
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecords.map((record) => {
              const meta = TYPE_META[record.type] ?? TYPE_META.GUIDE;
              const Icon = meta.icon;
              return (
                <Link
                  key={record.id}
                  href={`/capitalisation/${record.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-[#2563eb]/30 transition-all flex flex-col gap-4 h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', meta.bg)}>
                          <Icon size={14} className={meta.color} />
                        </div>
                        <span className={cn('text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded', meta.bg, meta.color)}>
                          {meta.label}
                        </span>
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded shrink-0',
                        record.status === 'PUBLIE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                      )}>
                        {record.status === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-[#2563eb] transition-colors">
                      {record.title}
                    </h3>

                    {/* Context */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed flex-1">
                      {record.context}
                    </p>

                    {/* Tags */}
                    {record.tags && record.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {record.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                            {tag}
                          </span>
                        ))}
                        {record.tags.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-medium">
                            +{record.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
