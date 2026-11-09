'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { billingApi, formatXof, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const PLAN_LABELS: Record<string, string> = {
  INDIVIDUEL: 'Individuel', PRO: 'Pro', EQUIPE: 'Équipe', ORGANISATION: 'Organisation', ENTERPRISE: 'Enterprise',
};
/** Vérification toutes les 3 s pendant 2 min au plus (le webhook DexPay arrive en général en quelques secondes). */
const POLL_MS = 3000;
const MAX_WAIT_MS = 120_000;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 max-w-lg w-full text-center">{children}</div>
    </div>
  );
}

function PaymentResult() {
  const reference = useSearchParams().get('ref');
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const refreshed = useRef(false);
  // Au-delà de MAX_WAIT_MS, on cesse d'attendre et on affiche l'état « en cours de traitement »
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  const { data: payment, error, isLoading } = useQuery({
    queryKey: ['payment-status', reference],
    queryFn: async () => (await billingApi.paymentStatus(reference!)).data,
    enabled: !!reference,
    refetchInterval: (query) => (query.state.data?.status === 'pending' && !timedOut ? POLL_MS : false),
  });

  // Formule activée : on recharge la session pour que les modules débloqués apparaissent tout de suite
  useEffect(() => {
    if (payment?.status === 'completed' && !refreshed.current) {
      refreshed.current = true;
      void refreshUser();
      void queryClient.invalidateQueries({ queryKey: ['billing'] });
    }
  }, [payment?.status, refreshUser, queryClient]);

  if (!reference) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Paiement introuvable</h1>
        <p className="text-slate-600 mb-6">Le lien de retour ne contient pas de référence de paiement.</p>
        <Link href="/settings?section=Abonnement" className="text-[#2563eb] font-semibold hover:underline">
          Voir mon abonnement
        </Link>
      </Shell>
    );
  }

  if (isLoading || (payment?.status === 'pending' && !timedOut)) {
    return (
      <Shell>
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <Loader2 size={36} className="text-[#2563eb] animate-spin" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3" aria-live="polite">Confirmation du paiement…</h1>
        <p className="text-slate-600">Nous attendons la confirmation de DexPay. Cela prend en général quelques secondes.</p>
        <p className="text-xs text-slate-400 mt-6">Référence : {reference}</p>
      </Shell>
    );
  }

  if (error || !payment) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Vérification impossible</h1>
        <p className="text-slate-600 mb-6">{getErrorMessage(error, 'Le statut du paiement n\'a pas pu être vérifié.')}</p>
        <Link href="/settings?section=Abonnement" className="text-[#2563eb] font-semibold hover:underline">
          Voir mon abonnement
        </Link>
      </Shell>
    );
  }

  if (payment.status === 'completed') {
    return (
      <Shell>
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Paiement confirmé</h1>
        <p className="text-slate-600 mb-6">
          La formule <strong>{PLAN_LABELS[payment.plan] ?? payment.plan}</strong> est active
          {payment.periodEnd && <> jusqu&apos;au <strong>{new Date(payment.periodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></>}.
          Un reçu vous a été envoyé par e-mail.
        </p>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-left mb-8 space-y-1">
          <p className="flex justify-between"><span className="text-slate-500">Montant</span><strong>{formatXof(payment.amount, payment.currency)}</strong></p>
          <p className="flex justify-between"><span className="text-slate-500">Référence</span><span className="font-mono text-xs">{payment.reference}</span></p>
        </div>
        <Link href="/dashboard" className="block w-full h-12 leading-[3rem] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-sm transition-colors">
          Aller au tableau de bord
        </Link>
      </Shell>
    );
  }

  if (payment.status === 'pending') {
    return (
      <Shell>
        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-amber-500" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Paiement en cours de traitement</h1>
        <p className="text-slate-600 mb-6">
          DexPay n&apos;a pas encore confirmé le paiement. Si vous avez validé l&apos;opération sur votre téléphone, la formule
          s&apos;activera automatiquement dès la confirmation. Vous recevrez un e-mail.
        </p>
        <Link href="/settings?section=Abonnement" className="text-[#2563eb] font-semibold hover:underline">
          Suivre mon abonnement
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
        <XCircle size={40} className="text-red-500" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">
        {payment.status === 'amount_mismatch' ? 'Paiement à vérifier' : 'Paiement non abouti'}
      </h1>
      <p className="text-slate-600 mb-6">
        {payment.status === 'amount_mismatch'
          ? 'Le montant reçu ne correspond pas à la formule choisie. Notre équipe va vérifier ; contactez support@planora360.org avec la référence ci-dessous.'
          : 'Le paiement a échoué ou a été annulé. Votre formule n\'a pas changé.'}
      </p>
      <p className="text-xs text-slate-400 mb-6">Référence : {payment.reference}</p>
      <Link href="/settings?section=Abonnement" className="block w-full h-12 leading-[3rem] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-sm transition-colors">
        Réessayer
      </Link>
    </Shell>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Shell><Loader2 size={32} className="text-[#2563eb] animate-spin mx-auto" aria-label="Chargement" /></Shell>}>
      <PaymentResult />
    </Suspense>
  );
}
