'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { AuthCardLayout } from '@/components/auth/auth-card-layout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentMessage, setSentMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(email.trim());
      setSentMessage(data.message);
    } catch (err) {
      setError(getErrorMessage(err, 'La demande n\'a pas pu être envoyée. Réessayez.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      asideTitle="Mot de passe oublié"
      asideText="Recevez par e-mail un lien pour choisir un nouveau mot de passe."
      asideItems={['Lien valable 30 minutes', 'Utilisable une seule fois', 'Vos sessions ouvertes seront fermées']}
    >
      {sentMessage ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <MailCheck size={26} className="text-emerald-600" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Vérifiez votre boîte e-mail</h1>
          <p role="status" className="text-[13px] text-slate-600 leading-relaxed mb-6">{sentMessage}</p>
          <p className="text-[12px] text-slate-500 mb-8">
            Rien reçu après quelques minutes ? Regardez dans les courriers indésirables, puis refaites une demande.
          </p>
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563eb] hover:underline">
            <ArrowLeft size={14} aria-hidden="true" /> Retour à la connexion
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-bold text-slate-900 mb-1.5">Mot de passe oublié</h1>
          <p className="text-[13px] text-slate-500 mb-7">
            Indiquez l&apos;adresse e-mail de votre compte : nous vous enverrons un lien de réinitialisation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-[12px] font-semibold text-slate-900 mb-1.5">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                placeholder="vous@organisation.org"
              />
            </div>

            {error && <p role="alert" className="text-[12px] text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-11 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white text-[13px] font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
              Envoyer le lien
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft size={14} aria-hidden="true" /> Retour à la connexion
            </Link>
          </div>
        </>
      )}
    </AuthCardLayout>
  );
}
