'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, RefreshCcw } from 'lucide-react';
import { billingApi } from '@/lib/api';

function PaymentFailed() {
  const reference = useSearchParams().get('ref');

  // Le serveur vérifie le statut auprès de DexPay et enregistre l'échec (ou l'activation si le paiement est passé)
  useEffect(() => {
    if (reference) billingApi.paymentStatus(reference).catch(() => undefined);
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">Paiement non abouti</h1>
        <p className="text-base text-slate-600 leading-relaxed mb-8">
          Le paiement n&apos;a pas été validé : aucun montant n&apos;a été débité et votre formule n&apos;a pas changé.
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-8 text-left">
          <h2 className="text-sm font-bold text-amber-900 mb-2">Causes fréquentes</h2>
          <ul className="text-sm text-amber-700 space-y-1.5 list-disc pl-5">
            <li>Solde insuffisant sur le compte mobile money</li>
            <li>Opération non validée sur le téléphone à temps</li>
            <li>Paiement annulé sur la page DexPay</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/settings?section=Abonnement"
            className="flex items-center justify-center gap-2 w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-sm transition-colors"
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Réessayer
          </Link>
          <Link
            href="/dashboard"
            className="block w-full h-12 leading-[3rem] text-center border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Retour au tableau de bord
          </Link>
          {reference && <p className="text-xs text-slate-400 pt-2">Référence : {reference}</p>}
          <p className="text-xs text-slate-400">
            Besoin d&apos;aide ? Écrivez à{' '}
            <a href="mailto:support@planora360.org" className="text-[#2563eb] hover:underline font-medium">
              support@planora360.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailed />
    </Suspense>
  );
}
