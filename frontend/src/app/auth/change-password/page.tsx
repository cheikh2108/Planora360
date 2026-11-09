'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi, getErrorMessage } from '@/lib/api';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'actuel.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      // Mettre à jour l'user en localStorage
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), mustChangePassword: false }));
        }
      } catch {
        /* stockage indisponible : l'état sera relu depuis /auth/me */
      }
      const dest = user?.role?.name === 'Super administrateur' ? '/super-admin' : '/dashboard';
      router.replace(dest);
    } catch (err) {
      setError(getErrorMessage(err, 'Une erreur est survenue. Veuillez réessayer.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">

      {/* Accent stripe */}
      <div className="hidden lg:block w-1.5 bg-[#2563eb] shrink-0" />

      {/* Left panel */}
      <div className="hidden lg:flex w-[48%] shrink-0 flex-col bg-[#eef5ff] relative overflow-hidden border-r border-[#2563eb]/10 items-center justify-center px-12">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#2563eb]/10 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0b1629] flex items-center justify-center">
            <ShieldCheck size={28} className="text-[#2563eb]" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#0b1629] tracking-tight">Sécurisez votre compte</p>
            <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
              Vous vous connectez pour la première fois. Choisissez un mot de passe personnel pour protéger votre accès.
            </p>
          </div>
          <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-5 w-full max-w-xs text-left space-y-2.5">
            {[
              '8 caractères minimum',
              'Lettres majuscules et minuscules',
              'Au moins un chiffre',
            ].map(rule => (
              <div key={rule} className="flex items-center gap-2.5 text-[12px] text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shrink-0" />
                {rule}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 flex flex-col justify-center px-10 sm:px-16 xl:px-20">

          <div className="w-full max-w-[340px]">

            {/* Logo mobile */}
            <div className="flex items-center gap-2.5 mb-10 lg:hidden">
              <img src="/logo-dark.svg" alt="PLANORA 360" className="h-24 w-auto" />
            </div>

            <p className="text-[10px] font-bold text-[#2563eb] uppercase tracking-[0.2em] mb-3 border-l-2 border-[#2563eb] pl-2.5 leading-none py-0.5">
              Première connexion
            </p>
            <h1 className="text-[2.2rem] font-extrabold text-[#020617] tracking-tight leading-[1.1] mb-2">
              Nouveau mot<br />de passe.
            </h1>
            <p className="text-slate-600 text-[13px] mb-8 leading-relaxed">
              {user ? `Bonjour ${user.firstName}, c` : 'C'}hoisissez un mot de passe personnel.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-[12px] font-semibold text-slate-900 mb-1.5">
                  Mot de passe actuel (ou provisoire)
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    autoFocus
                    autoComplete="current-password"
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    aria-label={showCurrent ? 'Masquer le mot de passe actuel' : 'Afficher le mot de passe actuel'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new-password" className="block text-[12px] font-semibold text-slate-900 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    aria-label={showNew ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-[12px] font-semibold text-slate-900 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 text-[12px] text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <span className="shrink-0 mt-0.5 text-red-400">&#9888;</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-bold rounded-xl text-[13px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.25)] mt-2 cursor-pointer"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Enregistrement…' : 'Définir mon mot de passe'}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full text-center text-[11px] text-slate-300 hover:text-slate-500 transition-colors cursor-pointer mt-1"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>

        <div className="px-10 sm:px-16 xl:px-20 py-5 shrink-0">
          <p className="text-[11px] text-slate-200 font-medium">© 2025 PLANORA 360</p>
        </div>
      </div>
    </div>
  );
}
