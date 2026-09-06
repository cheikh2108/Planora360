'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const isMock = searchParams.get('mock') === 'true';
  const reference = searchParams.get('ref');

  useEffect(() => {
    // Redirection automatique vers login après 5 secondes
    const timer = setTimeout(() => {
      window.location.href = '/auth/login';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isMock ? '✅ Inscription réussie (Mode Test)' : 'Paiement réussi !'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isMock
            ? 'Votre inscription a été créée avec succès en mode test. En production, vous seriez redirigé vers DexPay pour finaliser le paiement.'
            : 'Votre paiement a été confirmé avec succès.'
          }
        </p>

        {reference && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Référence</p>
            <p className="text-sm font-mono text-gray-900 break-all">{reference}</p>
          </div>
        )}

        {isMock && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800 font-medium mb-2">ℹ️ Mode Mock actif</p>
            <p className="text-xs text-yellow-700">
              L'intégration DexPay est temporairement désactivée. Votre inscription a été créée en base de données, mais aucun paiement réel n'a été effectué.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Redirection automatique vers la connexion dans 5 secondes...
        </p>

        <button
          onClick={() => window.location.href = '/auth/login'}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Se connecter maintenant
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
