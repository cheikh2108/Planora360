'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, SearchIcon, FileTextIcon, BookIcon, LightbulbIcon } from 'lucide-react';
import api from '@/lib/api';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BONNE_PRATIQUE':
        return <LightbulbIcon className="w-5 h-5" />;
      case 'RECIT_CHANGEMENT':
        return <BookIcon className="w-5 h-5" />;
      case 'GUIDE':
        return <FileTextIcon className="w-5 h-5" />;
      default:
        return <FileTextIcon className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BONNE_PRATIQUE':
        return 'Bonne pratique';
      case 'RECIT_CHANGEMENT':
        return 'Récit de changement';
      case 'GUIDE':
        return 'Guide';
      default:
        return type;
    }
  };

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(search.toLowerCase()) ||
    record.context.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Capitalisation</h1>
          <p className="text-muted-foreground mt-1">
            Bibliothèque de savoirs et bonnes pratiques
          </p>
        </div>
        <Button onClick={() => router.push('/capitalisation/new')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvelle fiche
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Chargement...</p>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileTextIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune fiche de capitalisation</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première fiche
            </p>
            <Button onClick={() => router.push('/capitalisation/new')}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Créer une fiche
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/capitalisation/${record.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(record.type)}
                    <Badge variant="secondary">{getTypeLabel(record.type)}</Badge>
                  </div>
                  <Badge variant={record.status === 'PUBLIE' ? 'default' : 'outline'}>
                    {record.status === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{record.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {record.context}
                </p>
                {record.tags && record.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {record.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {record.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{record.tags.length - 3}
                      </Badge>
                    )}
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
