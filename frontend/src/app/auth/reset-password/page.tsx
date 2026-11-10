'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';
import { authApi, getErrorMessage } from '@/lib/api';
import { AuthCardLayout } from '@/components/auth/auth-card-layout';

const RULES = [
  { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule et une minuscule', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: 'Au moins un chiffre', test: (p: string) => /\d/.test(p) },
];

const inputClass =
  'w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all';

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'done'>(token ? 'checking' : 'invalid');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lien vérifié avant la saisie : un lien expiré est signalé tout de suite
  useEffect(() => {
    if (!token) return;
    authApi
      .checkResetToken(token)
      .then(({ data }) => setStatus(data.valid ? 'valid' : 'invalid'))
      .catch(() => setStatus('invalid'));
  }, [token]);

  const allRulesOk = RULES.every(r => r.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!allRulesOk) {
      setError('Le mot de passe ne respecte pas toutes les règles.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setStatus('done');
      try { localStorage.removeItem('user'); } catch { /* stockage indisponible */ }
    } catch (err) {
      setError(getErrorMessage(err, 'Le mot de passe n\'a pas pu être modifié.'));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={28} className="text-[#2563eb] animate-spin" aria-label="Vérification du lien" />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle size={26} className="text-red-500" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Lien invalide ou expiré</h1>
        <p className="text-[13px] text-slate-600 leading-relaxed mb-8">
          Ce lien a déjà servi, a expiré (30 minutes) ou a été remplacé par une demande plus récente.
        </p>
        <Link
          href="/auth/forgot-password"
          className="block w-full h-11 leading-[2.75rem] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-bold transition-colors"
        >
          Faire une nouvelle demande
        </Link>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={26} className="text-emerald-600" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Mot de passe modifié</h1>
        <p role="status" className="text-[13px] text-slate-600 leading-relaxed mb-8">
          Toutes vos sessions ont été fermées. Connectez-vous avec votre nouveau mot de passe.
        </p>
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="w-full h-11 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-bold transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 mb-1.5">Nouveau mot de passe</h1>
      <p className="text-[13px] text-slate-500 mb-7">Choisissez le mot de passe que vous utiliserez désormais.</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="new-password" className="block text-[12px] font-semibold text-slate-900 mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-describedby="password-rules"
              className={inputClass}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <ul id="password-rules" className="mt-2 space-y-1">
            {RULES.map(rule => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={`flex items-center gap-2 text-[12px] ${ok ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-hidden="true" />
                  {rule.label}
                  <span className="sr-only">{ok ? ' : respecté' : ' : non respecté'}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-[12px] font-semibold text-slate-900 mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm-password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        {error && <p role="alert" className="text-[12px] text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white text-[13px] font-bold transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          Enregistrer le mot de passe
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCardLayout
      asideTitle="Nouveau mot de passe"
      asideText="Après l'enregistrement, toutes vos sessions ouvertes sont fermées par sécurité."
      asideItems={RULES.map(r => r.label)}
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCardLayout>
  );
}
