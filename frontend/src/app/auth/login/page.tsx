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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, totp || undefined);
      const dest = user.role?.name === 'Super administrateur' ? '/super-admin' : '/dashboard';
      router.replace(dest);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg === 'TOTP_REQUIRED') {
        setShow2fa(true);
        setError('Entrez votre code d\'authentification 2FA.');
      } else {
        setError(typeof msg === 'string' ? msg : 'Email ou mot de passe incorrect.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel gauche — branding */}
      <div className="hidden lg:flex flex-1 bg-[#0f1e38] flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center font-bold text-lg">A</div>
          <span className="text-xl font-bold">ATAABA Pilot</span>
        </div>
        <div>
          <blockquote className="text-2xl font-light leading-relaxed text-white/90 mb-6">
            "Planifier, exécuter, valider.<br />Chaque action compte."
          </blockquote>
          <div className="flex gap-8 text-sm text-white/50">
            <div><p className="text-2xl font-bold text-white mb-1">+150</p><p>Organisations</p></div>
            <div><p className="text-2xl font-bold text-white mb-1">+2 400</p><p>Plans d'action</p></div>
            <div><p className="text-2xl font-bold text-white mb-1">98%</p><p>Taux de satisfaction</p></div>
          </div>
        </div>
        <p className="text-xs text-white/30">© 2025 ATAABA Pilot. Tous droits réservés.</p>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#0f1e38] flex items-center justify-center font-bold text-white text-sm">A</div>
            <span className="font-bold text-slate-900">ATAABA Pilot</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Connexion</h2>
            <p className="text-sm text-slate-500 mb-8">Accédez à votre espace de gestion</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition"
                  placeholder="vous@organisation.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {show2fa && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Code d'authentification (2FA)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totp}
                    onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0f1e38] hover:bg-[#1a2e52] text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
