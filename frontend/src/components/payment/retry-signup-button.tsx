'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';

/** Relance le paiement d'une inscription non aboutie (sans connexion). */
export function RetrySignupButton({ reference }: { reference: string }) {
  const [state, setState] = useState<{ loading: boolean; error: string }>({ loading: false, error: '' });
  async function retry() {
    setState({ loading: true, error: '' });
    try {
      const { data } = await authApi.retrySignupPayment(reference);
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setState({ loading: false, error: getErrorMessage(err, 'Le paiement n\'a pas pu redémarrer, réessayez.') });
    }
  }
  return (
    <>
      {state.error && <p className="text-sm text-red-600 mb-3" role="alert">{state.error}</p>}
      <button
        type="button"
        onClick={retry}
        disabled={state.loading}
        className="flex items-center justify-center gap-2 w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors"
      >
        {state.loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        Réessayer le paiement
      </button>
    </>
  );
}

