'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [show2fa, setShow2fa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, totp || undefined);
      if (user.mustChangePassword) {
        router.replace('/auth/change-password');
        return;
      }
      const dest = user.role?.name === 'Super administrateur' ? '/super-admin' : '/dashboard';
      router.replace(dest);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg === 'TOTP_REQUIRED') {
        setShow2fa(true);
        setError("Entrez votre code d'authentification 2FA.");
      } else if (msg === 'REGISTRATION_PENDING') {
        setError('Votre inscription est en cours de validation. Vous recevrez un email dès que votre compte sera activé.');
      } else if (msg === 'REGISTRATION_REJECTED') {
        setError('Votre demande d\'inscription a été refusée. Contactez le support pour plus d\'informations.');
      } else {
        setError(typeof msg === 'string' ? msg : 'Email ou mot de passe incorrect.');
      }
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── Panneau gauche — teinté bleu institutionnel ──── */}
      <div className="hidden lg:flex w-[48%] shrink-0 flex-col bg-[#eef5ff] relative overflow-hidden">

        {/* Arc décoratif — CSS pur, intention architecturale */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[#2563eb]/10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-[#2563eb]/8 pointer-events-none"
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="relative px-10 pt-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0b1629] flex items-center justify-center font-extrabold text-white text-sm tracking-tight">
              P
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#0b1629] leading-none tracking-tight">PLANORA 360</p>
              <p className="text-[10px] text-[#2563eb]/60 leading-none mt-0.5">Gestion des plans d&apos;action</p>
            </div>
          </div>
        </div>

        {/* Illustration — remplit le panneau */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center px-8 py-4">
          <img
            src="/login-illustration.svg"
            alt=""
            aria-hidden="true"
            draggable="false"
            className="w-full h-full object-contain select-none pointer-events-none max-h-[420px]"
          />
        </div>

        {/* Stats — directement sur le fond teinté, sans card */}
        <div className="relative px-10 pb-10 shrink-0 grid grid-cols-3 gap-0 border-t border-[#2563eb]/10 pt-6">
          {[
            { value: '+150',   label: 'Organisations' },
            { value: '+2 400', label: "Plans d'action" },
            { value: '98%',    label: 'Satisfaction' },
          ].map((s, i) => (
            <div key={s.label} className={`flex flex-col gap-0.5 ${i > 0 ? 'pl-5 border-l border-[#2563eb]/10' : ''}`}>
              <p className="text-2xl font-extrabold text-[#0b1629] tabular-nums leading-none">{s.value}</p>
              <p className="text-[10px] text-[#2563eb]/60 font-medium leading-tight mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit — blanc pur ─────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border-l border-slate-100">

        {/* Date */}
        <div className="hidden lg:flex items-center justify-end px-12 pt-8 shrink-0">
          <p className="text-[11px] text-slate-300 capitalize">{today}</p>
        </div>

        {/* Formulaire centré */}
        <div className="flex-1 flex flex-col justify-center px-10 sm:px-16 xl:px-20">

          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#0b1629] flex items-center justify-center font-extrabold text-white text-sm">P</div>
            <span className="font-semibold text-slate-900 text-sm">PLANORA 360</span>
          </div>

          <div className="w-full max-w-[340px]">

            {/* Label avec ancre architecturale bleue */}
            <p className="text-[10px] font-bold text-[#2563eb] uppercase tracking-[0.2em] mb-3 border-l-2 border-[#2563eb] pl-2.5 leading-none py-0.5">
              Espace de pilotage
            </p>

            <h1 className="text-[2.75rem] font-extrabold text-[#020617] tracking-tight leading-[1] mb-2">
              Bon retour.
            </h1>
            <p className="text-slate-400 text-[13px] mb-8 leading-relaxed">
              Identifiez-vous pour accéder à vos tableaux de bord.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                  placeholder="vous@organisation.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {show2fa && (
                <div>
                  <label htmlFor="totp" className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                    Code 2FA
                  </label>
                  <input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totp}
                    onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[13px] text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              )}

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
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

          </div>
        </div>

        <div className="px-10 sm:px-16 xl:px-20 py-5 shrink-0 flex items-center justify-between">
          <p className="text-[11px] text-slate-200 font-medium">© 2025 PLANORA 360</p>
          <a href="/auth/register" className="text-[11px] text-[#2563eb] hover:underline font-medium">
            Demander un accès →
          </a>
        </div>
      </div>
    </div>
  );
}
