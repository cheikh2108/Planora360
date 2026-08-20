'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Lightbulb, FileText, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import api from '@/lib/api';

const TYPE_META: Record<string, { label: string; icon: typeof Lightbulb }> = {
  BONNE_PRATIQUE: { label: 'Bonne pratique', icon: Lightbulb },
  RECIT_CHANGEMENT: { label: 'Récit de changement', icon: BookOpen },
  GUIDE: { label: 'Guide', icon: FileText },
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
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <Header title="Chargement..." subtitle="Fiche de capitalisation" />
        <main className="flex-1 px-4 md:px-6 py-6">
          <div className="text-center text-slate-500">Chargement...</div>
        </main>
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
        subtitle={`Fiche de capitalisation - ${meta.label}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 size={14} className="mr-1.5" />
              Supprimer
            </Button>
            <Button variant="ghost" onClick={() => router.push('/capitalisation')}>
              Retour
            </Button>
          </>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* Infos générales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0f1e38] flex items-center justify-center shrink-0">
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Créé le {new Date(record.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Changement de statut */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Statut :</span>
              <Select value={status} onValueChange={handleStatusChange} disabled={saving}>
                <SelectTrigger className="w-32 h-8">
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
            <div className="flex flex-wrap gap-1.5">
              {record.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contexte */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Contexte</h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{record.context}</p>
        </div>

        {/* Défis et contraintes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Défis et contraintes</h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{record.challenges}</p>
        </div>

        {/* Solutions mises en œuvre */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Solutions mises en œuvre</h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{record.solutions}</p>
        </div>

        {/* Résultats obtenus */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Résultats obtenus</h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{record.results}</p>
        </div>

        {/* Leçons apprises */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Leçons apprises</h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{record.lessons}</p>
        </div>

        {/* Médias */}
        {record.media && record.media.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#2563eb]" />
              Médias ({record.media.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {record.media.map((media: any) => (
                <div key={media.id} className="aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
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
        )}
      </main>
    </div>
  );
}
