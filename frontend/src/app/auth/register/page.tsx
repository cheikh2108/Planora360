'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Loader2, CheckCircle2, ChevronLeft, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

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
  {
    id: 'PRO',
    label: 'Pro',
    description: 'Petites structures',
    priceMonthly: 'Sur devis',
    priceYearly: 'Sur devis',
    features: ['10 projets', '3 utilisateurs', 'Rapports avancés', 'Workflow validation'],
  },
  {
    id: 'EQUIPE',
    label: 'Équipe',
    description: 'PME & associations',
    priceMonthly: 'Sur devis',
    priceYearly: 'Sur devis',
    features: ['25 projets', '10 utilisateurs', 'Cartographie', 'Gestion documentaire', 'Passation marchés'],
  },
  {
    id: 'ORGANISATION',
    label: 'Organisation',
    description: 'ONG & programmes',
    priceMonthly: 'Sur devis',
    priceYearly: 'Sur devis',
    features: ['50 projets', '25 utilisateurs', 'Passation complète', 'Rapports bailleurs', 'Audit'],
  },
  {
    id: 'ENTERPRISE',
    label: 'Enterprise',
    description: 'Grandes organisations',
    priceMonthly: 'Sur devis',
    priceYearly: 'Sur devis',
    features: ['Illimité', 'Environnement dédié', 'Intégrations API', 'SLA garanti', 'Support premium'],
  },
];

export default function RegisterPage() {
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

  // Modal de demande de devis
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [estimatedUsers, setEstimatedUsers] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === plan);
  const displayPrice = billingCycle === 'YEARLY' ? selectedPlan?.priceYearly : selectedPlan?.priceMonthly;

  async function handleSubmit() {
    setError('');

    // Si ce n'est pas INDIVIDUEL → ouvrir modal devis
    if (plan !== 'INDIVIDUEL') {
      setShowQuoteModal(true);
      return;
    }

    // INDIVIDUEL → paiement direct
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

      // Redirection automatique vers DexPay
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Une erreur est survenue, veuillez réessayer.');
      setLoading(false);
    }
  }

  async function handleQuoteRequest() {
    setQuoteLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/request-quote`, {
        organizationName: orgName,
        plan,
        billingCycle,
        firstName,
        lastName,
        email,
        estimatedUsers: estimatedUsers ? parseInt(estimatedUsers) : undefined,
        message: customMessage,
      });

      setQuoteSent(true);
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 3000);
    } catch (err) {
      setError('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
      setQuoteLoading(false);
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
                      ? 'Après validation du paiement, vous recevrez un email de vérification puis vos identifiants.'
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
                  disabled={loading || !firstName.trim() || !lastName.trim() || !email.trim()}
                  onClick={handleSubmit}
                  className="w-full h-11 bg-[#0f1e38] hover:bg-[#162d52] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading
                    ? 'Redirection vers le paiement...'
                    : plan === 'INDIVIDUEL'
                      ? "S'inscrire et payer"
                      : 'Demander un devis'}
                </button>

                {plan === 'INDIVIDUEL' && (
                  <p className="text-[10px] text-center text-slate-500">
                    Vous serez redirigé vers notre plateforme de paiement sécurisée DexPay.
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

      {/* Modal Demande de devis */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            {!quoteSent ? (
              <>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Demande de devis</h3>
                  <p className="text-sm text-slate-500">
                    Complétez les informations ci-dessous. Notre équipe vous contactera sous 48h.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                      Nombre d&apos;utilisateurs estimé (optionnel)
                    </label>
                    <input
                      type="number"
                      value={estimatedUsers}
                      onChange={(e) => setEstimatedUsers(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
                      placeholder="Ex: 10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                      Message personnalisé (optionnel)
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all resize-none"
                      placeholder="Décrivez vos besoins spécifiques..."
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong className="font-semibold">Récapitulatif :</strong> Plan {selectedPlan?.label} (
                      {billingCycle === 'YEARLY' ? 'Annuel' : 'Mensuel'}) pour {orgName}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={quoteLoading}
                    onClick={handleQuoteRequest}
                    className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {quoteLoading && <Loader2 size={15} className="animate-spin" />}
                    {quoteLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Demande envoyée !</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Notre équipe commerciale vous contactera sous 48h. Redirection vers la connexion...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
