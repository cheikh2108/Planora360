'use client';

import { CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-lg w-full">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">Paiement réussi !</h1>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            Votre paiement a été traité avec succès. Vous allez recevoir un email de vérification dans quelques instants.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1">Prochaine étape</h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Consultez votre boîte mail et cliquez sur le lien de vérification pour activer votre compte.
                  <br />
                  <span className="text-xs text-blue-600 font-medium">Le lien est valable pendant 24 heures.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full h-12 leading-[3rem] text-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-sm transition-colors"
            >
              Aller à la page de connexion
            </Link>
            <p className="text-xs text-slate-400">
              Vous ne recevez pas l&apos;email ? Vérifiez vos spams ou contactez-nous à{' '}
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
