'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { UserPlus, Upload, FileSpreadsheet, Phone, CreditCard, DollarSign } from 'lucide-react';

export default function ParticipantsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header
        title="Participants"
        subtitle="Gérez les participants de vos activités"
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/participants/import')}>
              <Upload size={14} className="mr-1.5" />
              Importer Excel
            </Button>
            <Button onClick={() => router.push('/participants/new')}>
              <UserPlus size={14} className="mr-1.5" />
              Ajouter
            </Button>
          </>
        }
      />

      <main className="flex-1 px-4 md:px-6 py-6 space-y-5">
        <EmptyState
          icon={UserPlus}
          title="Aucun participant"
          description="Ajoutez des participants manuellement ou importez une liste Excel"
          action={
            <div className="flex gap-2">
              <Button onClick={() => router.push('/participants/new')}>
                <UserPlus size={14} className="mr-1.5" />
                Ajouter un participant
              </Button>
              <Button variant="secondary" onClick={() => router.push('/participants/import')}>
                <Upload size={14} className="mr-1.5" />
                Importer Excel
              </Button>
            </div>
          }
        />

        {/* Format attendu */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#0f1e38] flex items-center justify-center shrink-0">
              <FileSpreadsheet size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Format du fichier Excel</h3>
              <p className="text-xs text-slate-400 mt-0.5">Votre fichier doit contenir les colonnes suivantes</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-32 shrink-0 font-medium text-slate-700">Prénom</div>
              <div className="text-slate-500">Prénom du participant</div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-32 shrink-0 font-medium text-slate-700">Nom</div>
              <div className="text-slate-500">Nom du participant</div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-32 shrink-0 font-medium text-slate-700 flex items-center gap-1.5">
                <Phone size={12} className="text-slate-400" />
                Téléphone
              </div>
              <div className="text-slate-500">Numéro de téléphone</div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-32 shrink-0 font-medium text-slate-700 flex items-center gap-1.5">
                <CreditCard size={12} className="text-slate-400" />
                Mode de paiement
              </div>
              <div className="text-slate-500">WAVE ou ORANGE_MONEY</div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-32 shrink-0 font-medium text-slate-700 flex items-center gap-1.5">
                <DollarSign size={12} className="text-slate-400" />
                Montant
              </div>
              <div className="text-slate-500">Montant en FCFA</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
