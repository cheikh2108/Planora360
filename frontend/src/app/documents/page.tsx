'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { plansApi, activitiesApi, getErrorMessage } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import type { ActionPlan, Activity } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { FormField, Select } from '@/components/ui/form-field';
import { formatDate, cn } from '@/lib/utils';
import {
  FileText, Upload, Download, Trash2, Search, Filter,
  FileSpreadsheet, Image, Archive, File, FolderOpen,
  ChevronDown, ExternalLink, AlertCircle,
} from 'lucide-react';
import { resolveFileUrl } from '@/lib/files';

/* ─── Types ─────────────────────────────────────────────────── */

const DOC_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'TDR', label: 'Termes de référence' },
  { value: 'BUDGET', label: 'Budget' },
  { value: 'CONTRAT', label: 'Contrat' },
  { value: 'LISTE_PRESENCE', label: 'Liste de présence' },
  { value: 'RAPPORT', label: 'Rapport' },
  { value: 'PV', label: 'Procès-verbal' },
  { value: 'FACTURE', label: 'Facture' },
  { value: 'PHOTO', label: 'Photographie' },
  { value: 'LIVRABLE', label: 'Livrable' },
  { value: 'VALIDATION', label: 'Document de validation' },
  { value: 'AUTRE', label: 'Autre' },
] as const;

interface Document {
  id: string;
  fileName: string;
  type: string;
  storageKey: string;
  createdAt: string;
  activity?: {
    id: string;
    title: string;
    axis?: { title: string; actionPlan?: { title: string } };
  };
  uploadedBy?: { firstName: string; lastName: string };
}

/* ─── Icon helper ─────────────────────────────────────────────── */

function DocIcon({ fileName, size = 18 }: { fileName: string; size?: number }) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
    return <Image size={size} className="text-purple-500" />;
  if (['xlsx', 'xls', 'csv'].includes(ext))
    return <FileSpreadsheet size={size} className="text-green-600" />;
  if (['pdf'].includes(ext))
    return <FileText size={size} className="text-red-500" />;
  if (['zip', 'rar', '7z'].includes(ext))
    return <Archive size={size} className="text-amber-500" />;
  if (['doc', 'docx'].includes(ext))
    return <FileText size={size} className="text-blue-500" />;
  return <File size={size} className="text-slate-600" />;
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    TDR: 'bg-indigo-50 text-indigo-700',
    BUDGET: 'bg-green-50 text-green-700',
    CONTRAT: 'bg-blue-50 text-blue-700',
    RAPPORT: 'bg-amber-50 text-amber-700',
    PV: 'bg-teal-50 text-teal-700',
    FACTURE: 'bg-orange-50 text-orange-700',
    PHOTO: 'bg-purple-50 text-purple-700',
    LIVRABLE: 'bg-rose-50 text-rose-700',
    VALIDATION: 'bg-emerald-50 text-emerald-700',
  };
  return map[type] ?? 'bg-slate-100 text-slate-600';
}

/* ─── Upload zone ─────────────────────────────────────────────── */

function UploadZone({
  activityId,
  docType,
  onDone,
}: {
  activityId: string;
  docType: string;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File) {
    if (!activityId) { setError('Sélectionnez une activité.'); return; }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (docType) fd.append('type', docType);
      await api.post(`/activities/${activityId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onDone();
    } catch {
      setError('Échec de l\'upload. Vérifiez que l\'activité existe.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-2xl p-6 text-center transition-colors',
        dragging ? 'border-[#2563eb] bg-blue-50' : 'border-slate-300 hover:border-slate-400',
        uploading && 'opacity-60 pointer-events-none',
      )}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }}
      />
      <Upload size={24} className={cn('mx-auto mb-3', dragging ? 'text-[#2563eb]' : 'text-slate-600')} />
      <p className="text-sm text-slate-700 font-medium mb-1">
        {uploading ? 'Envoi en cours...' : 'Déposez un fichier ici'}
      </p>
      <p className="text-xs text-slate-600 mb-3">ou</p>
      <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} isLoading={uploading}>
        Parcourir
      </Button>
      {error && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-red-600 mt-3">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function DocumentsPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadActivityId, setUploadActivityId] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: plans = [] } = useQuery<ActionPlan[]>({
    queryKey: ['plans'],
    queryFn: async () => { const r = await plansApi.list({ limit: 1000 }); return (r.data as any).data ?? []; },
  });

  const { data: allActivities = [] } = useQuery<Activity[]>({
    queryKey: ['activities-docs-dropdown'],
    queryFn: async () => { const r = await activitiesApi.list({ limit: 1000 }); return (r.data as any).data ?? []; },
    staleTime: 60_000,
  });

  // Activities for selected plan
  const selectedPlan = plans.find(p => p.id === filterPlan);
  const planActivities = filterPlan
    ? allActivities.filter(a => (a.axis as any)?.actionPlanId === filterPlan)
    : allActivities;

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', filterPlan, filterActivity, filterType],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterActivity) {
        const r = await api.get(`/activities/${filterActivity}/documents`);
        return r.data;
      }
      // Fetch all docs via activity list
      const activitiesRes = await api.get('/activities', {
        params: { ...(filterPlan ? { planId: filterPlan } : {}), limit: 1000 },
      });
      const activities = (activitiesRes.data as any)?.data ?? [];
      const docs: Document[] = [];
      await Promise.allSettled(
        activities.slice(0, 30).map(async (act: { id: string }) => {
          const r = await api.get(`/activities/${act.id}/documents`);
          docs.push(...(r.data ?? []));
        })
      );
      return docs;
    },
  });

  const { mutate: deleteDoc } = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const filtered = documents.filter(d => {
    const matchSearch = !search || d.fileName.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || d.type === filterType;
    return matchSearch && matchType;
  });

  // Group by plan+activity
  const grouped = filtered.reduce<Record<string, Document[]>>((acc, d) => {
    const key = d.activity
      ? `${d.activity.axis?.actionPlan?.title ?? 'Plan inconnu'} › ${d.activity.title}`
      : 'Documents généraux';
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  async function downloadDoc(doc: Document) {
    try {
      const r = await api.get(`/documents/${doc.id}/download`);
      const url = resolveFileUrl(r.data?.url ?? r.data?.signedUrl);
      if (url) window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error('Téléchargement impossible', getErrorMessage(err, 'Le document n\'a pas pu être ouvert.'));
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Gestion documentaire"
        subtitle={`${filtered.length} document${filtered.length > 1 ? 's' : ''}`}
      />
      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un document..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-white"
            />
          </div>

          {/* Plan filter */}
          <select
            value={filterPlan}
            onChange={e => { setFilterPlan(e.target.value); setFilterActivity(''); }}
            className="h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white min-w-40"
          >
            <option value="">Tous les plans</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>

          {/* Activity filter (only if plan selected) */}
          {planActivities.length > 0 && (
            <select
              value={filterActivity}
              onChange={e => setFilterActivity(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white min-w-40"
            >
              <option value="">Toutes les activités</option>
              {planActivities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          )}

          {/* Type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
          >
            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <div className="flex items-center gap-2 ml-auto">
            {/* View mode toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={cn('px-3 py-2 text-xs font-medium transition-colors', viewMode === 'table' ? 'bg-[#0f1e38] text-white' : 'text-slate-500 hover:bg-slate-50')}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn('px-3 py-2 text-xs font-medium transition-colors', viewMode === 'grid' ? 'bg-[#0f1e38] text-white' : 'text-slate-500 hover:bg-slate-50')}
              >
                Grille
              </button>
            </div>
            <Button icon={<Upload size={15} />} onClick={() => setShowUpload(v => !v)}>
              Ajouter
            </Button>
          </div>
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-900">Ajouter un document</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Activité concernée" required>
                <select
                  value={uploadActivityId}
                  onChange={e => setUploadActivityId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
                >
                  <option value="">Sélectionner une activité</option>
                  {(filterPlan ? planActivities : allActivities).map(act => (
                    <option key={act.id} value={act.id}>
                      {act.axis?.title ? `${act.axis.title} › ` : ''}{act.title}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Type de document">
                <Select
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                >
                  {DOC_TYPES.slice(1).map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </FormField>
            </div>
            <UploadZone
              activityId={uploadActivityId}
              docType={uploadType}
              onDone={() => {
                qc.invalidateQueries({ queryKey: ['documents'] });
                setShowUpload(false);
                setUploadActivityId('');
                setUploadType('');
              }}
            />
          </div>
        )}

        {/* Documents */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            illustration="document"
            title="Aucun document"
            description="Ajoutez des pièces justificatives, contrats, rapports et autres documents liés à vos activités."
            action={{
              label: 'Ajouter un document',
              onClick: () => setShowUpload(true),
              leftIcon: <Upload size={15} />
            }}
          />
        ) : viewMode === 'grid' ? (
          // Grid view
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, docs]) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen size={14} className="text-slate-600" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{group}</p>
                  <span className="text-xs text-slate-600">({docs.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {docs.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:shadow-md hover:border-[#2563eb]/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <DocIcon fileName={doc.fileName} size={24} />
                        <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-md shrink-0', typeColor(doc.type))}>
                          {doc.type || 'Autre'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-tight flex-1">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-slate-600">{formatDate(doc.createdAt)}</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => downloadDoc(doc)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-[#0f1e38] hover:text-white transition-colors"
                        >
                          <Download size={12} /> Ouvrir
                        </button>
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table view grouped
          <div className="space-y-4">
            {Object.entries(grouped).map(([group, docs]) => (
              <div key={group} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                  <FolderOpen size={14} className="text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600 truncate flex-1">{group}</p>
                  <span className="text-xs text-slate-600">{docs.length} fichier{docs.length > 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                      <DocIcon fileName={doc.fileName} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {doc.uploadedBy && (
                            <span className="text-xs text-slate-600">
                              {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                            </span>
                          )}
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-600">{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline-flex', typeColor(doc.type))}>
                        {DOC_TYPES.find(t => t.value === doc.type)?.label ?? doc.type ?? 'Autre'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => downloadDoc(doc)}
                          title="Télécharger"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#2563eb] hover:bg-blue-50 transition-colors"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
