'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Eye, EyeOff, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Plan = 'DECOUVERTE' | 'PROFESSIONNELLE' | 'SUR_MESURE';

const PLANS: { id: Plan; label: string; description: string; price: string; features: string[] }[] = [
  {
    id: 'DECOUVERTE',
    label: 'Découverte',
    description: 'Idéal pour démarrer',
    price: 'Gratuit 30 jours',
    features: ["Jusqu'à 3 plans d'action", '5 utilisateurs', 'Support e-mail'],
  },
  {
    id: 'PROFESSIONNELLE',
    label: 'Professionnelle',
    description: 'Pour les équipes actives',
    price: 'Sur devis',
    features: ['Plans illimités', '25 utilisateurs', 'Rapports avancés', 'Support prioritaire'],
  },
  {
    id: 'SUR_MESURE',
    label: 'Entreprise',
    description: 'Pour les grandes organisations',
    price: 'Sur devis',
    features: ['Tout illimité', 'SSO / LDAP', 'SLA garanti', 'Accompagnement dédié'],
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [plan, setPlan] = useState<Plan>('DECOUVERTE');
  const [orgName, setOrgName] = useState('');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await authApi.register({ organizationName: orgName, subscriptionPlan: plan, brandColor, firstName, lastName, email, password });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Une erreur est survenue, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Demande envoyée</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Votre demande d&apos;inscription a bien été reçue. Notre équipe va examiner votre dossier et vous contacterez par e-mail sous 48h.
          </p>
          <Link
            href="/auth/login"
            className="block w-full h-11 leading-[2.75rem] text-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0b1629] flex items-center justify-center font-extrabold text-white text-sm">A</div>
        <span className="font-semibold text-slate-900 text-sm">ATAABA Pilot</span>
      </div>

      {/* Form container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {([1, 2, 3] as const).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  step === s ? 'bg-[#2563eb] text-white' :
                  step > s ? 'bg-emerald-500 text-white' :
                  'bg-white text-slate-400 border border-slate-200'
                )}>
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  step === s ? 'text-[#2563eb]' : step > s ? 'text-emerald-600' : 'text-slate-400'
                )}>
                  {s === 1 ? 'Organisation' : s === 2 ? 'Responsable' : 'Mot de passe'}
                </span>
                {s < 3 && <div className={cn('w-8 h-px', step > s ? 'bg-emerald-400' : 'bg-slate-200')} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8">

            {/* Step 1 — Organisation + plan */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Votre organisation</h2>
                  <p className="text-sm text-slate-500 mt-1">Renseignez le nom de votre organisation et choisissez une formule.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Nom de l&apos;organisation <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="Ex: Ministère de l'Agriculture"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Couleur de marque
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {['#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#16a34a','#0891b2','#0f172a'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBrandColor(c)}
                          className={cn(
                            'w-7 h-7 rounded-full transition-all border-2',
                            brandColor === c ? 'border-slate-700 scale-110' : 'border-transparent hover:scale-105'
                          )}
                          style={{ background: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="w-7 h-7 rounded-full border-2 border-slate-200 overflow-hidden shrink-0">
                        <input
                          type="color"
                          value={brandColor}
                          onChange={e => setBrandColor(e.target.value)}
                          className="w-10 h-10 -translate-x-1 -translate-y-1 cursor-pointer"
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-500">{brandColor}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full" style={{ background: brandColor }} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-3">Formule souhaitée</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PLANS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlan(p.id)}
                        className={cn(
                          'text-left p-4 rounded-xl border-2 transition-all cursor-pointer',
                          plan === p.id
                            ? 'border-[#2563eb] bg-blue-50/60'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900">{p.label}</span>
                          {plan === p.id && <CheckCircle2 size={15} className="text-[#2563eb] shrink-0" />}
                        </div>
                        <p className="text-[11px] font-semibold text-[#2563eb] mb-2">{p.price}</p>
                        <p className="text-[11px] text-slate-500 mb-2">{p.description}</p>
                        <ul className="space-y-1">
                          {p.features.map(f => (
                            <li key={f} className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!orgName.trim()}
                  onClick={() => setStep(2)}
                  className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* Step 2 — Responsable */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-4 cursor-pointer transition-colors">
                    <ChevronLeft size={14} /> Retour
                  </button>
                  <h2 className="text-xl font-bold text-slate-900">Responsable du compte</h2>
                  <p className="text-sm text-slate-500 mt-1">Informations du compte administrateur de votre organisation.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prénom <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Adresse e-mail <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    placeholder="vous@organisation.com"
                  />
                </div>

                <button
                  type="button"
                  disabled={!firstName.trim() || !lastName.trim() || !email.trim()}
                  onClick={() => setStep(3)}
                  className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* Step 3 — Mot de passe */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-4 cursor-pointer transition-colors">
                    <ChevronLeft size={14} /> Retour
                  </button>
                  <h2 className="text-xl font-bold text-slate-900">Sécurisez votre compte</h2>
                  <p className="text-sm text-slate-500 mt-1">Choisissez un mot de passe fort pour votre compte administrateur.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mot de passe <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      placeholder="Minimum 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-colors',
                              password.length >= i * 3
                                ? i <= 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : i === 3 ? 'bg-blue-400' : 'bg-emerald-500'
                                : 'bg-slate-200'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {password.length < 4 ? 'Trop court' : password.length < 7 ? 'Faible' : password.length < 10 ? 'Moyen' : 'Fort'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Récapitulatif */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Récapitulatif</p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p><span className="font-medium text-slate-700">Organisation :</span> {orgName}</p>
                    <p><span className="font-medium text-slate-700">Formule :</span> {PLANS.find(p => p.id === plan)?.label}</p>
                    <p><span className="font-medium text-slate-700">Responsable :</span> {firstName} {lastName}</p>
                    <p><span className="font-medium text-slate-700">E-mail :</span> {email}</p>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                    <span className="shrink-0 mt-0.5 text-red-400">&#9888;</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading || password.length < 8}
                  onClick={handleSubmit}
                  className="w-full h-11 bg-[#0f1e38] hover:bg-[#162d52] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Envoi en cours…' : 'Envoyer la demande'}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-[#2563eb] hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
