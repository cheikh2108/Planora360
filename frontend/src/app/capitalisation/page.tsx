'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, BookOpen, Lightbulb, FileText } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const TYPE_META: Record<string, { label: string; icon: typeof Lightbulb }> = {
  BONNE_PRATIQUE: { label: 'Bonne pratique', icon: Lightbulb },
  RECIT_CHANGEMENT: { label: 'Récit de changement', icon: BookOpen },
  GUIDE: { label: 'Guide', icon: FileText },
};

export default function CapitalisationPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(search.toLowerCase()) ||
    record.context.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Capitalisation"
        subtitle="Bibliothèque de savoirs et bonnes pratiques"
        actions={
          <Button onClick={() => router.push('/capitalisation/new')}>
            <Plus size={14} className="mr-1.5" />
            Nouvelle fiche
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Rechercher une fiche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            illustration="document"
            title="Aucune fiche de capitalisation"
            description="Documentez vos bonnes pratiques et enseignements"
            action={{
              label: 'Créer une fiche',
              onClick: () => router.push('/capitalisation/new'),
              leftIcon: <Plus size={14} />
            }}
          />
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
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-[#2563eb]/30 transition-all flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0f1e38] flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-white" />
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {meta.label}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        record.status === 'PUBLIE' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {record.status === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {record.title}
                    </h3>

                    {/* Context */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {record.context}
                    </p>

                    {/* Tags */}
                    {record.tags && record.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                        {record.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            {tag}
                          </span>
                        ))}
                        {record.tags.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">
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
