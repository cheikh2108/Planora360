'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Building2, Users, Mail, Phone, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

const PLANS = [
  {
    id: 'PRO',
    label: 'Pro',
    desc: 'Jusqu\'à 3 utilisateurs',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'EQUIPE',
    label: 'Équipe',
    desc: 'Jusqu\'à 10 utilisateurs',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'ORGANISATION',
    label: 'Organisation',
    desc: 'Jusqu\'à 25 utilisateurs',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'ENTERPRISE',
    label: 'Enterprise',
    desc: 'Utilisateurs illimités',
    color: 'from-orange-500 to-red-500'
  },
];

export default function ContactCommercialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'PRO' | 'EQUIPE' | 'ORGANISATION' | 'ENTERPRISE'>('PRO');
  const [estimatedUsers, setEstimatedUsers] = useState('');
  const [message, setMessage] = useState('');

  // Pré-remplir le message selon le plan
  const updateMessageForPlan = (selectedPlan: string) => {
    const templates = {
      PRO: `Bonjour,\n\nJe souhaite obtenir un devis pour le plan Pro de PLANORA 360.\n\nNotre organisation compte environ ${estimatedUsers || '[X]'} employés et nous avons besoin d'une solution pour gérer nos procédures de marchés publics.\n\nPouvez-vous me communiquer vos tarifs et conditions ?\n\nCordialement`,
      EQUIPE: `Bonjour,\n\nNotre équipe de ${estimatedUsers || '[X]'} personnes recherche une solution collaborative pour la gestion de nos marchés publics.\n\nNous sommes intéressés par le plan Équipe et souhaiterions connaître vos conditions tarifaires.\n\nMerci de nous recontacter rapidement.\n\nCordialement`,
      ORGANISATION: `Bonjour,\n\nNous représentons une organisation de ${estimatedUsers || '[X]'} collaborateurs et recherchons une solution complète pour digitaliser nos processus de passation de marchés.\n\nPouvez-vous nous proposer un devis détaillé pour le plan Organisation ?\n\nCordialement`,
      ENTERPRISE: `Bonjour,\n\nNous recherchons une solution sur-mesure pour notre organisation de ${estimatedUsers || '[X]'} employés.\n\nNos besoins incluent potentiellement :\n- Déploiement dédié\n- Intégrations spécifiques\n- Support prioritaire\n- Formation des équipes\n\nPouvons-nous organiser un rendez-vous pour discuter de nos besoins ?\n\nCordialement`,
    };
    setMessage(templates[selectedPlan as keyof typeof templates]);
  };

  const handlePlanChange = (newPlan: any) => {
    setPlan(newPlan);
    updateMessageForPlan(newPlan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/request-quote`, {
        email,
        fullName,
        organization,
        phone: phone || undefined,
        plan,
        estimatedUsers: estimatedUsers ? parseInt(estimatedUsers) : undefined,
        message,
      });

      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Demande envoyée !</h1>
          <p className="text-slate-600 mb-6">
            Notre équipe commerciale vous contactera sous <strong>48h ouvrées</strong>.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-500 mb-1">Un email de confirmation a été envoyé à</p>
            <p className="text-sm font-medium text-slate-900">{email}</p>
          </div>
          <p className="text-sm text-slate-500">Redirection vers la page de connexion dans 5 secondes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5ff]">
      {/* Header */}
      <div className="px-6 py-5">
        <img src="/logo-dark.svg" alt="PLANORA 360" className="h-24 w-auto" />
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-12 items-start">

          {/* Left column - Messaging (asymmetric: 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                PLANS ENTREPRISE ?
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                Parlons de vos besoins
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Nos plans Pro, Équipe, Organisation et Enterprise sont conçus sur-mesure
                pour s'adapter à la taille et aux besoins de votre organisation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Multi-utilisateurs</h3>
                  <p className="text-sm text-slate-600">Jusqu'à 9999 utilisateurs selon votre plan</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Support prioritaire</h3>
                  <p className="text-sm text-slate-600">Assistance dédiée et temps de réponse garantis</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Formation incluse</h3>
                  <p className="text-sm text-slate-600">Accompagnement à la prise en main de la plateforme</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-slate-600 mb-4">
                <strong className="text-slate-900">Temps de réponse :</strong> Notre équipe vous contacte sous 48h ouvrées.
              </p>
              <p className="text-xs text-slate-500">
                En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe commerciale
                concernant nos solutions entreprise.
              </p>
            </div>
          </div>

          {/* Right column - Form (asymmetric: 3 cols) */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Plan selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Plan souhaité *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePlanChange(p.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        plan === p.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`text-sm font-bold mb-1 ${plan === p.id ? 'text-blue-700' : 'text-slate-900'}`}>
                        {p.label}
                      </div>
                      <div className="text-xs text-slate-500">{p.desc}</div>
                      {plan === p.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1.5 text-slate-400" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="nom@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1.5 text-slate-400" />
                    Organisation *
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nom de votre organisation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1.5 text-slate-400" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  Nombre d'utilisateurs estimés *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={estimatedUsers}
                  onChange={(e) => {
                    setEstimatedUsers(e.target.value);
                    if (message) {
                      // Update message with new user count
                      setMessage(message.replace(/\[X\]|\d+(?= employés| personnes| collaborateurs)/, e.target.value));
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ex: 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message personnalisé *
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Décrivez vos besoins..."
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Vous pouvez personnaliser ce message pré-rempli selon vos besoins.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  'Envoi en cours...'
                ) : (
                  <>
                    Envoyer ma demande
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                Vous avez déjà un compte ?{' '}
                <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Se connecter
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
