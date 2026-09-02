'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Lightbulb, FileText, Trash2, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const TYPE_META: Record<string, { label: string; icon: typeof Lightbulb; color: string; bg: string }> = {
  BONNE_PRATIQUE: { label: 'Bonne pratique', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
  RECIT_CHANGEMENT: { label: 'Récit de changement', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  GUIDE: { label: 'Guide', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
};

export default function CapitalisationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('BROUILLON');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecord();
  }, [params.id]);

  const loadRecord = async () => {
    try {
      const response = await api.get(`/capitalization/${params.id}`);
      setRecord(response.data);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Erreur chargement fiche:', error);
      alert('Fiche introuvable');
      router.push('/capitalisation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche ?')) return;

    try {
      await api.delete(`/capitalization/${params.id}`);
      router.push('/capitalisation');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      await api.patch(`/capitalization/${params.id}`, { status: newStatus });
      setStatus(newStatus);
      setRecord({ ...record, status: newStatus });
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <Header title="Chargement..." subtitle="Fiche de capitalisation" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      </div>
    );
  }

  if (!record) return null;

  const meta = TYPE_META[record.type] ?? TYPE_META.GUIDE;
  const Icon = meta.icon;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title={record.title}
        subtitle={`Fiche de capitalisation`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              icon={<ArrowLeft size={16} />}
              onClick={() => router.push('/capitalisation')}
            >
              Retour
            </Button>
            <Button
              variant="ghost"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Supprimer
            </Button>
          </div>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* Infos générales */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Informations Générales
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', meta.bg)}>
                  <Icon size={18} className={meta.color} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded', meta.bg, meta.color)}>
                      {meta.label}
                    </span>
                    <span className={cn(
                      'text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded',
                      status === 'PUBLIE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                    )}>
                      {status === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Créé le {new Date(record.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Changement de statut */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Statut :</span>
                <Select value={status} onValueChange={handleStatusChange} disabled={saving}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BROUILLON">Brouillon</SelectItem>
                    <SelectItem value="PUBLIE">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {record.tags && record.tags.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {record.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contexte */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Contexte
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{record.context}</p>
          </div>
        </div>

        {/* Défis et contraintes */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Défis et Contraintes
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{record.challenges}</p>
          </div>
        </div>

        {/* Solutions mises en œuvre */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Solutions Mises en Œuvre
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{record.solutions}</p>
          </div>
        </div>

        {/* Résultats obtenus */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Résultats Obtenus
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{record.results}</p>
          </div>
        </div>

        {/* Leçons apprises */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Leçons Apprises
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{record.lessons}</p>
          </div>
        </div>

        {/* Médias */}
        {record.media && record.media.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon size={14} className="text-slate-600" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Médias ({record.media.length})
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {record.media.map((media: any) => (
                  <div key={media.id} className="aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors">
                    {media.type === 'PHOTO' ? (
                      <img src={media.url} alt={media.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={32} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
