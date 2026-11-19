'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarClock, Loader2, LogOut } from 'lucide-react';
import { billingApi, formatXof, getErrorMessage, type BillingCycle } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const PLAN_LABELS: Record<string, string> = {
  SOLO: 'Solo', INDIVIDUEL: 'Individuel', PRO: 'Pro', EQUIPE: 'Équipe', ORGANISATION: 'Organisation', ENTERPRISE: 'Enterprise',
};

function formatDate(value: string | null | undefined) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Page de renouvellement : l'application y renvoie quand l'abonnement a expiré (réponse 402),
 * et les e-mails de relance y mènent. Seul l'administrateur peut payer.
 */
export default function RenewPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role?.name === 'Administrateur';
  const [cycle, setCycle] = useState<BillingCycle | null>(null);

  const subscription = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => (await billingApi.subscription()).data,
    enabled: !!user && isAdmin,
  });
  const catalog = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => (await billingApi.plans()).data,
    enabled: !!user,
  });

  const sub = subscription.data;
  const plan = sub?.subscriptionPlan ?? user?.organization?.subscriptionPlan;
  const entry = catalog.data?.plans.find((p) => p.plan === plan);
  const selectedCycle: BillingCycle = cycle ?? sub?.billingCycle ?? 'MONTHLY';
  const price = entry?.prices?.[selectedCycle];
  const expired = !!sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() <= Date.now();

  const pay = useMutation({
    mutationFn: async () => (await billingApi.checkout(plan!, selectedCycle)).data,
    onSuccess: (data) => {
      window.location.href = data.paymentUrl;
    },
  });

  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 max-w-lg w-full">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
          <CalendarClock size={28} className="text-amber-600" aria-hidden="true" />
        </div>

        {!user ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Renouveler l’abonnement</h1>
            <p className="text-slate-600 mb-6">Connectez-vous avec le compte administrateur pour renouveler l’abonnement.</p>
            <Link href="/auth/login" className="block w-full h-12 leading-[3rem] text-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-sm transition-colors">
              Se connecter
            </Link>
          </>
        ) : !isAdmin ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Abonnement expiré</h1>
            <p className="text-slate-600 mb-6">
              L’abonnement de <strong>{user.organization?.name ?? 'votre organisation'}</strong> a expiré. Demandez à
              l’administrateur de votre organisation de le renouveler : vos données sont conservées.
            </p>
          </>
        ) : subscription.isLoading || catalog.isLoading ? (
          <Loader2 size={28} className="text-[#2563eb] animate-spin" aria-label="Chargement" />
        ) : subscription.isError || catalog.isError || !entry?.prices ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Renouvellement indisponible</h1>
            <p className="text-slate-600 mb-6">
              {getErrorMessage(subscription.error ?? catalog.error, 'Contactez contact@planora360.org pour renouveler votre abonnement.')}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {expired ? 'Votre abonnement a expiré' : 'Renouveler votre abonnement'}
            </h1>
            <p className="text-slate-600 mb-6">
              {expired ? (
                <>Formule <strong>{PLAN_LABELS[plan!] ?? plan}</strong>, expirée le <strong>{formatDate(sub?.currentPeriodEnd)}</strong>. Vos données sont conservées et redeviennent accessibles dès le paiement.</>
              ) : sub?.currentPeriodEnd ? (
                <>Formule <strong>{PLAN_LABELS[plan!] ?? plan}</strong>, active jusqu’au <strong>{formatDate(sub.currentPeriodEnd)}</strong>. La nouvelle période s’ajoute à la suite.</>
              ) : (
                <>Formule <strong>{PLAN_LABELS[plan!] ?? plan}</strong>.</>
              )}
            </p>

            <div role="radiogroup" aria-label="Durée" className="grid grid-cols-2 gap-3 mb-6">
              {(['MONTHLY', 'YEARLY'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={selectedCycle === c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-colors',
                    selectedCycle === c ? 'border-[#2563eb] bg-blue-50/60' : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className="block text-sm font-semibold text-slate-900">{c === 'MONTHLY' ? 'Mensuel' : 'Annuel'}</span>
                  <span className="block text-xs text-slate-600 mt-0.5">
                    {entry.prices && formatXof(entry.prices[c], entry.currency)}
                    {c === 'MONTHLY' ? ' / mois' : ' / an'}
                  </span>
                </button>
              ))}
            </div>

            {pay.isError && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {getErrorMessage(pay.error, 'Le paiement n’a pas pu démarrer, réessayez.')}
              </p>
            )}

            <button
              type="button"
              onClick={() => pay.mutate()}
              disabled={pay.isPending || !price}
              className="w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {pay.isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {price ? `Payer ${formatXof(price, entry.currency)}` : 'Payer'}
            </button>
            {!expired && (
              <Link href="/dashboard" className="block text-center text-sm text-slate-600 hover:text-slate-900 mt-4">
                Retour au tableau de bord
              </Link>
            )}
          </>
        )}

        {user && (
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-6 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mx-auto"
          >
            <LogOut size={13} aria-hidden="true" /> Se déconnecter
          </button>
        )}
      </div>
    </div>
  );
}
