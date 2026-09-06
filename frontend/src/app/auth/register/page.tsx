'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Plan = 'INDIVIDUEL' | 'PRO' | 'EQUIPE' | 'ORGANISATION' | 'ENTERPRISE';
type BillingCycle = 'MONTHLY' | 'YEARLY';

const PLANS: {
  id: Plan;
  label: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
}[] = [
  {
    id: 'INDIVIDUEL',
    label: 'Individuel',
    description: 'Pour démarrer',
    priceMonthly: '10 000 FCFA/mois',
    priceYearly: '100 000 FCFA/an',
    features: ['3 projets', '1 utilisateur', 'Tableau de bord personnel', 'Support e-mail'],
  },
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [plan, setPlan] = useState<Plan>('INDIVIDUEL');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [orgName, setOrgName] = useState('');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lire le plan depuis l'URL au chargement
  useEffect(() => {
    const urlPlan = searchParams.get('plan')?.toUpperCase() as Plan | null;
    if (urlPlan && PLANS.some(p => p.id === urlPlan)) {
      setPlan(urlPlan);
    }
  }, [searchParams]);

  // Récupérer le CSRF token au chargement de la page
  useEffect(() => {
    fetch('/api/auth/csrf', { credentials: 'include' })
      .then(res => res.json())
      .catch(err => console.error('Failed to fetch CSRF token:', err));
  }, []);

  const selectedPlan = PLANS.find((p) => p.id === plan);
  const displayPrice = billingCycle === 'YEARLY' ? selectedPlan?.priceYearly : selectedPlan?.priceMonthly;

  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit() {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await authApi.register({
        organizationName: orgName,
        subscriptionPlan: plan,
        billingCycle,
        brandColor,
        firstName,
        lastName,
        email,
      });

      // Nouveau flow : inscription en attente d'approbation
      if (response.data.status === 'PENDING_APPROVAL') {
        const message = response.data.message ||
          'Demande d\'inscription reçue ! Un administrateur va examiner votre demande et vous recevrez un email de confirmation sous 24-48h.';
        setSuccessMessage(message);
        setLoading(false);

        // Rediriger vers la page de connexion après 5 secondes
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 5000);
      }
      // Ancien flow : redirection vers paiement (si le paiement est réactivé plus tard)
      else if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
      // Autre cas de succès
      else if (response.data.success) {
        setSuccessMessage(response.data.message || 'Inscription réussie !');
        setLoading(false);
      }
      else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Une erreur est survenue, veuillez réessayer.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3">
        <img src="/logo-dark.svg" alt="PLANORA 360" className="h-24 w-auto" />
      </div>

      {/* Form container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {([1, 2] as const).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    step === s
                      ? 'bg-[#2563eb] text-white'
                      : step > s
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                  )}
                >
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    step === s ? 'text-[#2563eb]' : step > s ? 'text-emerald-600' : 'text-slate-600'
                  )}
                >
                  {s === 1 ? 'Organisation' : 'Responsable'}
                </span>
                {s < 2 && <div className={cn('w-8 h-px', step > s ? 'bg-emerald-400' : 'bg-slate-200')} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            {/* Step 1 — Organisation + plan */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Votre organisation</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Renseignez le nom de votre organisation et choisissez une formule.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                    Nom de l&apos;organisation <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Ex: Ministère de l'Agriculture"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">Couleur de marque</label>

                  {/* Couleurs prédéfinies */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0891b2', '#0f172a'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBrandColor(c)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all border-2',
                          brandColor === c ? 'border-slate-700 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                        )}
                        style={{ background: c }}
                        aria-label={c}
                      />
                    ))}
                  </div>

                  {/* Couleur personnalisée */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 border-slate-200 overflow-hidden shrink-0">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-14 h-14 -translate-x-2 -translate-y-2 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(value)) {
                          setBrandColor(value);
                        }
                      }}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      maxLength={7}
                      placeholder="#2563eb"
                    />
                  </div>

                  {/* Aperçu */}
                  <div className="mt-3 h-2 rounded-full transition-all" style={{ background: brandColor }} />
                </div>

                {/* Toggle Monthly/Yearly */}
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-3">Cycle de facturation</label>
                  <div className="inline-flex items-center bg-slate-100 rounded-full p-1">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('MONTHLY')}
                      className={cn(
                        'px-6 py-2 rounded-full text-sm font-semibold transition-all',
                        billingCycle === 'MONTHLY'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Mensuel
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('YEARLY')}
                      className={cn(
                        'px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
                        billingCycle === 'YEARLY'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Annuel
                      {plan === 'INDIVIDUEL' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                          2 MOIS OFFERTS
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-3">Formule souhaitée</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PLANS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlan(p.id)}
                        className={cn(
                          'text-left p-4 rounded-xl border-2 transition-all cursor-pointer',
                          plan === p.id ? 'border-[#2563eb] bg-blue-50/60' : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900">{p.label}</span>
                          {plan === p.id && <CheckCircle2 size={15} className="text-[#2563eb] shrink-0" />}
                        </div>
                        <p className="text-[11px] font-semibold text-[#2563eb] mb-2">
                          {billingCycle === 'YEARLY' ? p.priceYearly : p.priceMonthly}
                        </p>
                        <p className="text-[11px] text-slate-500 mb-2">{p.description}</p>
                        <ul className="space-y-1">
                          {p.features.map((f) => (
                            <li key={f} className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>

                  {/* Call-to-action Plans Entreprise */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                          Besoin d'un plan entreprise ?
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">
                          Plans Pro, Équipe, Organisation et Enterprise disponibles sur devis.
                        </p>
                        <Link
                          href="/contact-commercial"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <span>Contactez notre équipe commerciale</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
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

            {/* Step 2 — Responsable + Paiement */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-600 mb-4 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} /> Retour
                  </button>
                  <h2 className="text-xl font-bold text-slate-900">Responsable du compte</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {plan === 'INDIVIDUEL'
                      ? 'Votre demande sera examinée par notre équipe. Vous recevrez un email avec vos identifiants sous 24-48h.'
                      : 'Notre équipe commerciale vous contactera sous 48h pour vous proposer une offre personnalisée.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                      Prénom <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                      Nom <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                    Adresse e-mail <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                    placeholder="vous@organisation.com"
                  />
                </div>

                {/* Récapitulatif */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Récapitulatif</p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>
                      <span className="font-medium text-slate-700">Organisation :</span> {orgName}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Formule :</span> {selectedPlan?.label}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Tarif :</span> {displayPrice}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Cycle :</span>{' '}
                      {billingCycle === 'YEARLY' ? 'Annuel' : 'Mensuel'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">Responsable :</span> {firstName} {lastName}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">E-mail :</span> {email}
                    </p>
                  </div>
                </div>

                {successMessage && (
                  <div className="space-y-3">
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl"
                    >
                      <span className="shrink-0 mt-0.5 text-emerald-500">✓</span>
                      <div>
                        <p className="font-semibold mb-1">{successMessage}</p>
                        <p className="text-emerald-600 text-[11px]">
                          Vous recevrez un email avec vos identifiants une fois votre demande approuvée.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Redirection vers la page de connexion...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
                  >
                    <span className="shrink-0 mt-0.5 text-red-400">&#9888;</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading || !firstName.trim() || !lastName.trim() || !email.trim() || !!successMessage}
                  onClick={handleSubmit}
                  className="w-full h-11 bg-[#0f1e38] hover:bg-[#162d52] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading
                    ? 'Envoi de la demande...'
                    : successMessage
                      ? 'Demande envoyée ✓'
                      : plan === 'INDIVIDUEL'
                        ? "Demander l'accès"
                        : 'Demander un devis'}
                </button>

                {plan === 'INDIVIDUEL' && !successMessage && (
                  <p className="text-[10px] text-center text-slate-500">
                    Votre demande sera examinée par notre équipe sous 24-48h.
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
