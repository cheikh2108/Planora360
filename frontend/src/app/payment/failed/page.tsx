'use client';

import { XCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-lg w-full">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-500" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">Paiement échoué</h1>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            Votre paiement n&apos;a pas pu être traité. Aucun montant n&apos;a été débité de votre compte.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-sm font-bold text-amber-900 mb-2">Causes possibles :</h3>
            <ul className="text-sm text-amber-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>Solde insuffisant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>Problème technique avec votre moyen de paiement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>Connexion Internet interrompue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                <span>Transaction annulée</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-sm transition-colors"
            >
              <RefreshCcw size={16} />
              Réessayer l&apos;inscription
            </Link>
            <Link
              href="/auth/login"
              className="block w-full h-12 leading-[3rem] text-center border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Retour à la connexion
            </Link>
            <p className="text-xs text-slate-400 mt-4">
              Besoin d&apos;aide ? Contactez-nous à{' '}
              <a href="mailto:support@planora360.org" className="text-[#2563eb] hover:underline font-medium">
                support@planora360.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
