'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeftIcon, UploadIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-8 h-8 p-0">
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Importer des participants</h1>
          <p className="text-muted-foreground mt-1">
            Importez une liste de participants depuis un fichier Excel
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionner l'activité et le fichier</CardTitle>
          <CardDescription>
            Choisissez l'activité concernée et uploadez votre fichier Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityId">Activité</Label>
            <Input
              id="activityId"
              placeholder="ID de l'activité"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Entrez l'ID de l'activité pour laquelle vous importez les participants
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fichier Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Fichier sélectionné : {file.name}
              </p>
            )}
          </div>

          <Button
            onClick={handleImport}
            disabled={!file || !activityId || loading}
            className="w-full"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            {loading ? 'Import en cours...' : 'Importer'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2Icon className="w-5 h-5 text-green-600" />
                  Import réussi
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                  Erreurs d'import
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <Alert>
                <AlertDescription>
                  {result.imported} participants importés sur {result.total}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">Erreurs trouvées :</p>
                {result.errors.map((error: any, idx: number) => (
                  <Alert key={idx} variant="destructive">
                    <AlertDescription>
                      Ligne {error.line} : {error.error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
