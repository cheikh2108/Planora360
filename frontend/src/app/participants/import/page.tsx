'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ImportParticipantsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [activityId, setActivityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !activityId) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('activityId', activityId);

      const response = await api.post('/participants/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error: any) {
      setResult({
        success: false,
        errors: [{ line: 0, error: error.response?.data?.message || 'Erreur lors de l\'import' }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Importer des participants"
        subtitle="Importez une liste depuis un fichier Excel"
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="activityId" className="text-sm font-medium text-slate-900">
              ID de l'activité *
            </label>
            <Input
              id="activityId"
              placeholder="Entrez l'ID de l'activité"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              L'ID de l'activité à laquelle ces participants seront rattachés
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium text-slate-900">
              Fichier Excel *
            </label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-xs text-slate-500">
                Fichier sélectionné : <span className="font-medium text-slate-700">{file.name}</span>
              </p>
            )}
          </div>

          <Button
            onClick={handleImport}
            disabled={!file || !activityId || loading}
            className="w-full"
            loading={loading}
          >
            <Upload size={14} className="mr-1.5" />
            {loading ? 'Import en cours...' : 'Importer'}
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              {result.success ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Import réussi</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {result.imported} participants importés sur {result.total}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <XCircle size={16} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Erreurs d'import</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Des erreurs ont été détectées dans le fichier
                    </p>
                  </div>
                </>
              )}
            </div>

            {!result.success && result.errors && (
              <div className="space-y-2 mt-4">
                {result.errors.map((error: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                    <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      <span className="font-semibold">Ligne {error.line}</span> : {error.error}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
