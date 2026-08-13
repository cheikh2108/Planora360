'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, UploadIcon } from 'lucide-react';

export default function ParticipantsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Participants</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les participants de vos activités
          </p>
        </div>
        <Button onClick={() => router.push('/participants/import')}>
          <UploadIcon className="w-4 h-4 mr-2" />
          Importer Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importer des participants</CardTitle>
          <CardDescription>
            Importez une liste de participants depuis un fichier Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UploadIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun participant importé</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par importer un fichier Excel avec la liste des participants
            </p>
            <Button onClick={() => router.push('/participants/import')}>
              <UploadIcon className="w-4 h-4 mr-2" />
              Importer maintenant
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Format du fichier Excel</CardTitle>
          <CardDescription>
            Votre fichier Excel doit contenir les colonnes suivantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-32 font-medium">Prénom</div>
              <div className="text-muted-foreground">Prénom du participant</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 font-medium">Nom</div>
              <div className="text-muted-foreground">Nom du participant</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 font-medium">Téléphone</div>
              <div className="text-muted-foreground">Numéro de téléphone</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 font-medium">Mode de paiement</div>
              <div className="text-muted-foreground">WAVE ou ORANGE_MONEY</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 font-medium">Montant</div>
              <div className="text-muted-foreground">Montant en FCFA</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
