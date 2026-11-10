'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { authApi, billingApi, formatXof, getErrorMessage, type BillingCycle, type PaymentSummary } from '@/lib/api';
import api from '@/lib/api';
import { Header } from '@/components/layout/header';
import { NotificationPreferencesSection } from '@/components/settings/notification-preferences-section';
import { Button } from '@/components/ui/button';
import { FormField, Input } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import {
  Shield, Key, User, Bell, CheckCircle2, QrCode, CreditCard,
  Check, Zap, MessageSquare, Users, FolderKanban, ArrowRight, Star,
  LayoutGrid, X, Palette, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/lib/types';

const ALL_SECTIONS = ['Profil', 'Apparence', 'Sécurité', 'Notifications', 'Abonnement'] as const;
type Section = typeof ALL_SECTIONS[number];

/* ─── Données formules ───────────────────────────────────────── */

interface PlanInfo {
  key: SubscriptionPlan;
  label: string;
  tagline: string;
  color: string;
  ring: string;
  badge?: string;
  limits: { plans: string; users: string };
  features: { label: string; included: boolean }[];
}

const PLANS: PlanInfo[] = [
  {
    key: 'INDIVIDUEL',
    label: 'Individuel',
    tagline: 'Accès de base',
    color: 'bg-emerald-50 border-emerald-200',
    ring: 'ring-emerald-300',
    limits: { plans: '3 plans actifs', users: '1 utilisateur' },
    features: [
      { label: 'Dashboard', included: true },
      { label: 'Activités & check-lists', included: true },
      { label: 'Documents', included: true },
      { label: 'Planification', included: true },
      { label: 'Messagerie', included: true },
      { label: 'Capitalisation', included: false },
      { label: 'Budget', included: false },
      { label: 'Module Passation', included: false },
    ],
  },
  {
    key: 'PRO',
    label: 'Pro',
    tagline: 'Pour les professionnels actifs',
    color: 'bg-blue-50 border-blue-200',
    ring: 'ring-[#2563eb]',
    badge: 'Populaire',
    limits: { plans: '10 plans actifs', users: "Jusqu'à 3 utilisateurs" },
    features: [
      { label: 'Tout Individuel', included: true },
      { label: 'Capitalisation', included: true },
      { label: 'Budget', included: true },
      { label: 'Recommandations', included: false },
      { label: 'Indicateurs', included: false },
      { label: 'Module Passation', included: false },
    ],
  },
  {
    key: 'EQUIPE',
    label: 'Équipe',
    tagline: 'Collaboration renforcée',
    color: 'bg-purple-50 border-purple-200',
    ring: 'ring-purple-400',
    limits: { plans: '25 plans actifs', users: "Jusqu'à 10 utilisateurs" },
    features: [
      { label: 'Tout Pro', included: true },
      { label: 'Recommandations', included: true },
      { label: 'Indicateurs', included: true },
      { label: 'Validations', included: true },
      { label: 'Module Passation', included: false },
      { label: 'Audit', included: false },
    ],
  },
  {
    key: 'ORGANISATION',
    label: 'Organisation',
    tagline: 'Gestion des marchés publics',
    color: 'bg-indigo-50 border-indigo-200',
    ring: 'ring-indigo-400',
    limits: { plans: '50 plans actifs', users: "Jusqu'à 25 utilisateurs" },
    features: [
      { label: 'Tout Équipe', included: true },
      { label: 'Module Passation complet', included: true },
      { label: 'Demandes & Fournisseurs', included: true },
      { label: 'Procédures & Contrats', included: true },
      { label: 'Plan de Passation (PPM)', included: true },
      { label: 'Audit & Conformité', included: true },
    ],
  },
  {
    key: 'ENTERPRISE',
    label: 'Enterprise',
    tagline: 'Sans limites',
    color: 'bg-amber-50 border-amber-200',
    ring: 'ring-amber-400',
    limits: { plans: 'Illimité', users: 'Illimité' },
    features: [
      { label: 'Tout Organisation', included: true },
      { label: 'Pas de limites quantitatives', included: true },
      { label: 'Support prioritaire', included: true },
      { label: 'SSO / SAML (sur demande)', included: true },
      { label: 'Intégrations personnalisées', included: true },
      { label: 'SLA garanti', included: true },
    ],
  },
];

const PLAN_ORDER: SubscriptionPlan[] = ['INDIVIDUEL', 'PRO', 'EQUIPE', 'ORGANISATION', 'ENTERPRISE'];

/* ─── SubscriptionSection ────────────────────────────────────── */

const PAYMENT_STATUS: Record<PaymentSummary['status'], { label: string; className: string }> = {
  completed:       { label: 'Payé',              className: 'bg-emerald-50 text-emerald-700' },
  pending:         { label: 'En attente',        className: 'bg-amber-50 text-amber-700' },
  failed:          { label: 'Échoué',            className: 'bg-red-50 text-red-700' },
  cancelled:       { label: 'Annulé',            className: 'bg-slate-100 text-slate-600' },
  refunded:        { label: 'Remboursé',         className: 'bg-slate-100 text-slate-600' },
  amount_mismatch: { label: 'À vérifier',        className: 'bg-red-50 text-red-700' },
};

const formatDate = (iso: string | null | undefined) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)) : '—';

function SubscriptionSection({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const [targetPlan, setTargetPlan] = useState<PlanInfo | null>(null);
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');

  const { data: catalog } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => (await billingApi.plans()).data,
  });
  const { data: subscription } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => (await billingApi.subscription()).data,
  });

  // La formule vient de l'abonnement si disponible (plus récent que la session mise en cache)
  const plan = subscription?.subscriptionPlan ?? currentPlan;
  const currentIndex = PLAN_ORDER.indexOf(plan);
  const current = PLANS.find(p => p.key === plan)!;
  const onlinePayment = catalog?.onlinePayment ?? subscription?.onlinePayment ?? false;
  const priceOf = (key: SubscriptionPlan, c: BillingCycle) => catalog?.plans.find(p => p.plan === key)?.prices?.[c];

  const checkout = useMutation({
    mutationFn: async () => {
      if (!targetPlan) throw new Error('Aucune formule choisie');
      return (await billingApi.checkout(targetPlan.key, cycle)).data;
    },
    // Redirection vers la page de paiement DexPay ; le retour se fait sur /payment/success ou /payment/failed
    onSuccess: (data) => { window.location.href = data.paymentUrl; },
  });

  const openPlan = (p: PlanInfo) => { setTargetPlan(p); setCycle('MONTHLY'); checkout.reset(); };
  const closeModal = () => { if (!checkout.isPending) setTargetPlan(null); };

  const ACCENT: Record<SubscriptionPlan, { from: string; to: string; text: string; dot: string }> = {
    INDIVIDUEL:    { from: 'from-emerald-800', to: 'to-emerald-700', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    PRO:           { from: 'from-[#0f1e38]',   to: 'to-[#1a3a6e]',   text: 'text-blue-300',    dot: 'bg-blue-400' },
    EQUIPE:        { from: 'from-purple-800',  to: 'to-purple-700',  text: 'text-purple-300',  dot: 'bg-purple-400' },
    ORGANISATION:  { from: 'from-indigo-800',  to: 'to-indigo-700',  text: 'text-indigo-300',  dot: 'bg-indigo-400' },
    ENTERPRISE:    { from: 'from-amber-900',   to: 'to-amber-700',   text: 'text-amber-300',   dot: 'bg-amber-400' },
  };
  const acc = ACCENT[plan];
  const isPaidActive = subscription?.subscriptionStatus === 'ACTIVE' && !!subscription?.currentPeriodEnd;
  const statusLabel = subscription?.subscriptionStatus === 'TRIAL' ? 'Essai' : 'Actif';

  const targetMonthly = targetPlan ? priceOf(targetPlan.key, 'MONTHLY') : undefined;
  const targetYearly = targetPlan ? priceOf(targetPlan.key, 'YEARLY') : undefined;
  const targetPrice = cycle === 'YEARLY' ? targetYearly : targetMonthly;
  const yearlySaving = targetMonthly && targetYearly ? targetMonthly * 12 - targetYearly : 0;

  // Formules proposées : la formule actuelle (pour renouveler) et les formules supérieures
  const offers = PLANS.filter(p => PLAN_ORDER.indexOf(p.key) >= currentIndex && !(p.key === plan && p.key === 'ENTERPRISE'));

  return (
    <div className="space-y-4">

      {/* Bannière formule active */}
      <div className={cn('rounded-2xl bg-linear-to-br p-4 md:p-6 text-white relative overflow-hidden', acc.from, acc.to)}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -right-2 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Formule active</p>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{current.label}</h3>
              <p className={cn('text-xs md:text-sm mt-1', acc.text)}>
                {isPaidActive
                  ? `Valable jusqu'au ${formatDate(subscription?.currentPeriodEnd)} · ${subscription?.billingCycle === 'YEARLY' ? 'annuel' : 'mensuel'}`
                  : current.tagline}
              </p>
            </div>
            <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold shrink-0', acc.text)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', acc.dot)} />
              {statusLabel}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-white/8 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <FolderKanban size={13} className="text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40">Plans d&apos;action</p>
                <p className="text-xs md:text-sm font-semibold text-white leading-tight">{current.limits.plans}</p>
              </div>
            </div>
            <div className="bg-white/8 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Users size={13} className="text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40">Utilisateurs</p>
                <p className="text-xs md:text-sm font-semibold text-white leading-tight">{current.limits.users}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {current.features.filter(f => f.included).map(f => (
              <span key={f.label} className="flex items-center gap-1 text-[11px] text-white/70 bg-white/8 px-2 py-1 rounded-full">
                <Check size={9} className="text-green-400 shrink-0" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!onlinePayment && catalog && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <CreditCard size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Le paiement en ligne n&apos;est pas encore activé sur cette installation. Pour changer de formule, écrivez à{' '}
            <a href="mailto:support@planora360.org" className="font-semibold underline">support@planora360.org</a>.
          </p>
        </div>
      )}

      {/* Formules : renouveler ou évoluer */}
      {offers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-[#2563eb]" />
            <p className="text-sm font-semibold text-slate-800">Choisir une formule</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {offers.map(p => {
              const isCurrent = p.key === plan;
              const extras = p.features.filter(
                f => f.included && !current.features.find(cf => cf.label === f.label && cf.included)
              );
              const CARD_STYLES: Record<SubscriptionPlan, { border: string; icon: string }> = {
                INDIVIDUEL:    { border: 'border-emerald-200 bg-emerald-50/40', icon: 'text-emerald-600' },
                PRO:           { border: 'border-[#2563eb]/40 bg-blue-50/50',   icon: 'text-[#2563eb]' },
                EQUIPE:        { border: 'border-purple-200 bg-purple-50/40',   icon: 'text-purple-600' },
                ORGANISATION:  { border: 'border-indigo-200 bg-indigo-50/40',   icon: 'text-indigo-600' },
                ENTERPRISE:    { border: 'border-amber-200 bg-amber-50/40',     icon: 'text-amber-600' },
              };
              const style = CARD_STYLES[p.key];
              const monthly = priceOf(p.key, 'MONTHLY');
              return (
                <div key={p.key} className={cn('relative rounded-2xl border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4', style.border)}>
                  {p.badge && !isCurrent && (
                    <span className="absolute -top-2.5 left-4 text-[11px] font-bold bg-[#2563eb] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      {p.badge}
                    </span>
                  )}
                  <div className="sm:w-44 shrink-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Star size={12} className={cn('shrink-0', style.icon)} />
                      <p className="font-bold text-slate-900 text-sm">{p.label}</p>
                    </div>
                    <p className="text-xs text-slate-500 ml-[22px]">
                      {p.key === 'ENTERPRISE' ? 'Sur devis' : monthly ? `${formatXof(monthly)} / mois` : p.tagline}
                    </p>
                    <div className="flex gap-3 mt-1.5 ml-[22px]">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <FolderKanban size={9} className="text-slate-600" />{p.limits.plans}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users size={9} className="text-slate-600" />{p.limits.users}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px self-stretch bg-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      {isCurrent ? 'Votre formule' : 'Ce que vous gagnez'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {isCurrent ? (
                        <span className="text-xs text-slate-600">
                          {isPaidActive ? 'Renouveler : la nouvelle période s\'ajoute à la suite de l\'actuelle.' : 'Payer pour activer cette formule.'}
                        </span>
                      ) : extras.length === 0 ? (
                        <span className="text-xs text-slate-600 italic">Tout ce qui précède, en mieux</span>
                      ) : extras.map(f => (
                        <span key={f.label} className="flex items-center gap-1 text-xs text-slate-700">
                          <Check size={10} className="text-green-500 shrink-0" />{f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {p.key === 'ENTERPRISE' ? (
                      <Link
                        href="/contact-commercial"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <MessageSquare size={13} /> Nous contacter
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant={isCurrent ? 'secondary' : 'primary'}
                        icon={<ArrowRight size={13} />}
                        disabled={!onlinePayment}
                        onClick={() => openPlan(p)}
                      >
                        {isCurrent ? 'Renouveler' : 'Choisir'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {plan === 'ENTERPRISE' && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Star size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Formule maximale active</p>
            <p className="text-xs text-slate-500 mt-0.5">Pour toute modification, contactez l&apos;équipe PLANORA 360.</p>
          </div>
        </div>
      )}

      {/* Historique des paiements */}
      {subscription && subscription.payments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">Historique des paiements</p>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
            {subscription.payments.map(p => (
              <div key={p.reference} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {PLANS.find(x => x.key === p.plan)?.label ?? p.plan}
                    {p.billingCycle && <span className="text-slate-500 font-normal"> · {p.billingCycle === 'YEARLY' ? 'annuel' : 'mensuel'}</span>}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {formatDate(p.paidAt ?? p.createdAt)} · {p.reference}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-slate-900">{formatXof(p.amount, p.currency)}</span>
                  <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', PAYMENT_STATUS[p.status]?.className)}>
                    {PAYMENT_STATUS[p.status]?.label ?? p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <MessageSquare size={13} className="text-slate-600 shrink-0" />
        <p className="text-xs text-slate-500">
          Pour réduire votre formule ou toute autre demande :{' '}
          <a href="mailto:support@planora360.org" className="font-medium text-slate-700 hover:underline">support@planora360.org</a>
        </p>
      </div>

      {/* Paiement d'une formule */}
      <Modal open={!!targetPlan} onClose={closeModal} title={targetPlan ? `Formule ${targetPlan.label}` : ''} size="sm">
        {targetPlan && (
          <div className="space-y-4">
            <div role="radiogroup" aria-label="Durée de l'abonnement" className="grid grid-cols-2 gap-2">
              {(['MONTHLY', 'YEARLY'] as BillingCycle[]).map(c => {
                const price = priceOf(targetPlan.key, c);
                const selected = cycle === c;
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setCycle(c)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors',
                      selected ? 'border-[#2563eb] bg-blue-50 ring-2 ring-[#2563eb]/20' : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <p className="text-xs font-semibold text-slate-600">{c === 'MONTHLY' ? 'Mensuel' : 'Annuel'}</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{price ? formatXof(price) : '—'}</p>
                    <p className="text-[11px] text-slate-500">
                      {c === 'MONTHLY' ? 'par mois' : yearlySaving > 0 ? `par an · ${formatXof(yearlySaving)} économisés` : 'par an'}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <p>
                Paiement sécurisé par <strong>DexPay</strong> : Wave, Orange Money, Mixx by Yas ou carte bancaire.
              </p>
              <p>
                {targetPlan.key === plan && isPaidActive
                  ? `La période sera prolongée à partir du ${formatDate(subscription?.currentPeriodEnd)}.`
                  : 'La formule est activée dès la confirmation du paiement.'}
                {' '}Pas de renouvellement automatique.
              </p>
            </div>

            {checkout.isError && (
              <p role="alert" className="text-sm text-red-600">
                {getErrorMessage(checkout.error, 'Le paiement n\'a pas pu démarrer. Réessayez.')}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
              <Button variant="secondary" onClick={closeModal} disabled={checkout.isPending}>Annuler</Button>
              <Button
                icon={<CreditCard size={14} />}
                onClick={() => checkout.mutate()}
                isLoading={checkout.isPending || checkout.isSuccess}
                disabled={!targetPrice}
              >
                {targetPrice ? `Payer ${formatXof(targetPrice)}` : 'Payer'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ─── Validation couleur ─────────────────────────────────────── */

function isColorInvalid(hex: string): string | null {
  if (hex.length !== 7 || !hex.startsWith('#')) return null;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  const luminosity = (r + g + b) / (3 * 255);
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

  // Trop sombre (noir)
  if (luminosity < 0.15) return 'Les couleurs trop sombres rendent l\'interface illisible';

  // Trop clair (blanc)
  if (luminosity > 0.85) return 'Les couleurs trop claires rendent l\'interface illisible';

  // Gris (désaturé)
  if (maxDiff < 30) return 'Les couleurs grises rendent l\'interface illisible';

  return null;
}

/* ─── Page principale ────────────────────────────────────────── */

export default function SettingsPage() {
  const { user, setBrandColor } = useAuth();
  const isAdmin = ['Administrateur', 'Super administrateur'].includes(user?.role?.name ?? '');
  const SECTIONS = ALL_SECTIONS.filter(s => {
    if (s === 'Abonnement' && !isAdmin) return false;
    if (s === 'Apparence' && !isAdmin) return false;
    return true;
  });
  const [section, setSection] = useState<Section>('Profil');

  // Lien direct vers une section (ex. /settings?section=Abonnement après un paiement)
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('section');
    if (requested && (ALL_SECTIONS as readonly string[]).includes(requested)) {
      setSection(requested as Section); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrData, setQrData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [totpToken, setTotpToken] = useState('');
  const [enabled, setEnabled] = useState(false);

  const { mutate: setup2fa, isPending: setting2fa } = useMutation({
    mutationFn: () => authApi.setup2fa(),
    onSuccess: (res) => { setQrData(res.data); setQrModal(true); },
  });

  const { mutate: enable2fa, isPending: enabling } = useMutation({
    mutationFn: () => authApi.enable2fa(totpToken),
    onSuccess: () => { setEnabled(true); setQrModal(false); },
  });

  const [brandColorLocal, setBrandColorLocal] = useState(user?.organization?.brandColor ?? '#2563eb');
  const [colorSaved, setColorSaved] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);

  const { mutate: saveBrandColor, isPending: savingColor } = useMutation({
    mutationFn: (color: string) => {
      const error = isColorInvalid(color);
      if (error) throw new Error(error);
      return api.patch('/organizations/my/brand-color', { brandColor: color });
    },
    onSuccess: (_, color) => {
      setBrandColor(color);
      setColorSaved(true);
      setColorError(null);
      setTimeout(() => setColorSaved(false), 2000);
    },
    onError: (error: Error) => {
      setColorError(error.message);
      setTimeout(() => setColorError(null), 4000);
    },
  });

  const PRESET_COLORS = ['#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#16a34a','#0891b2','#b45309'];

  const SECTION_CONFIG: Record<Section, { icon: React.ElementType; desc: string }> = {
    Profil:        { icon: User,       desc: 'Identité & informations' },
    Apparence:     { icon: Palette,    desc: 'Couleur de marque' },
    Sécurité:      { icon: Shield,     desc: '2FA & mot de passe' },
    Notifications: { icon: Bell,       desc: 'Alertes & préférences' },
    Abonnement:    { icon: CreditCard, desc: 'Formule & limites' },
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-slate-50">
      <Header title="Paramètres" subtitle="Gérez votre compte et vos préférences" />

      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="max-w-4xl flex flex-col md:flex-row gap-5">

          {/* ── Nav sidebar (desktop uniquement) ── */}
          <nav className="md:w-56 shrink-0">
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {SECTIONS.map((s, i) => {
                const { icon: Icon, desc } = SECTION_CONFIG[s];
                const active = section === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSection(s)}
                    className={cn(
                      'relative flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors',
                      i < SECTIONS.length - 1 && 'border-b border-slate-100',
                      active ? 'bg-[#0f1e38] text-white' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-400 rounded-full" />
                    )}
                    <div className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                      active ? 'bg-white/10' : 'bg-slate-100'
                    )}>
                      <Icon size={15} className={active ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-none mb-0.5">{s}</p>
                      <p className={cn('text-[11px] truncate', active ? 'text-white/50' : 'text-slate-600')}>{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">

            {/* Profil */}
            {section === 'Profil' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Bandeau identité */}
                <div className="bg-[#0f1e38] px-5 py-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: 'var(--color-brand)', opacity: 0.85 }}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-base leading-tight truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-white/50 truncate mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-[11px] font-semibold bg-white/10 text-white/70 px-2.5 py-0.5 rounded-full">
                      {user?.role?.name}
                    </span>
                  </div>
                </div>

                {/* Champs */}
                <div className="p-5 md:p-6 space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Informations personnelles</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Prénom">
                      <Input defaultValue={user?.firstName} disabled />
                    </FormField>
                    <FormField label="Nom">
                      <Input defaultValue={user?.lastName} disabled />
                    </FormField>
                    <FormField label="Email" className="sm:col-span-2">
                      <Input type="email" defaultValue={user?.email} disabled />
                    </FormField>
                  </div>
                  <p className="text-xs text-slate-600 pt-1">Pour modifier ces informations, contactez votre administrateur.</p>
                </div>
              </div>
            )}

            {/* Apparence (Admin uniquement) */}
            {section === 'Apparence' && isAdmin && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Palette size={16} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Couleur de marque</p>
                    <p className="text-xs text-slate-500">Personnalise la sidebar, les boutons et les éléments actifs</p>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Aperçu */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 flex h-24">
                    <div className="w-16 flex flex-col items-center justify-center gap-2 shrink-0" style={{ backgroundColor: brandColorLocal }}>
                      <div className="w-6 h-1.5 rounded-full bg-white/40" />
                      <div className="w-6 h-1.5 rounded-full bg-white/70" />
                      <div className="w-6 h-1.5 rounded-full bg-white/40" />
                    </div>
                    <div className="flex-1 bg-slate-50 flex items-center px-4 gap-3">
                      <div className="h-8 px-4 rounded-xl text-white text-xs flex items-center font-medium" style={{ backgroundColor: brandColorLocal }}>
                        Bouton
                      </div>
                      <div className="text-xs font-medium" style={{ color: brandColorLocal }}>Lien actif</div>
                      <div className="h-2 w-24 rounded-full" style={{ backgroundColor: brandColorLocal, opacity: 0.2 }} />
                    </div>
                  </div>

                  {/* Palette prédéfinie */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2.5">Couleurs prédéfinies</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setBrandColorLocal(c);
                            setColorError(null);
                          }}
                          className={cn(
                            'w-8 h-8 rounded-full transition-all border-2',
                            brandColorLocal === c ? 'border-slate-700 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                          )}
                          style={{ background: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Couleur personnalisée */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2.5">Couleur personnalisée</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border-2 border-slate-200 overflow-hidden shrink-0">
                        <input
                          type="color"
                          value={brandColorLocal}
                          onChange={e => {
                            const color = e.target.value;
                            const error = isColorInvalid(color);
                            if (!error) {
                              setBrandColorLocal(color);
                              setColorError(null);
                            } else {
                              setColorError(error);
                            }
                          }}
                          className="w-14 h-14 -translate-x-2 -translate-y-2 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={brandColorLocal}
                        onChange={e => {
                          const value = e.target.value;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(value)) {
                            setBrandColorLocal(value);
                            if (value.length === 7) {
                              const error = isColorInvalid(value);
                              setColorError(error);
                            }
                          }
                        }}
                        className="w-28 h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none"
                        maxLength={7}
                        placeholder="#2563eb"
                      />
                    </div>
                    {colorError && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5">
                        <XCircle size={12} className="shrink-0" />
                        {colorError}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      isLoading={savingColor}
                      onClick={() => saveBrandColor(brandColorLocal)}
                      disabled={brandColorLocal.length !== 7 || !!isColorInvalid(brandColorLocal)}
                    >
                      {colorSaved ? <><CheckCircle2 size={14} /> Enregistré</> : 'Appliquer'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrandColorLocal(user?.organization?.brandColor ?? '#2563eb');
                        setColorError(null);
                      }}
                      className="text-xs text-slate-600 hover:text-slate-600 transition-colors"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sécurité */}
            {section === 'Sécurité' && (
              <div className="space-y-3">
                {/* 2FA */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Shield size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Authentification à deux facteurs</p>
                      <p className="text-xs text-slate-500">Google Authenticator ou app TOTP compatible</p>
                    </div>
                    {(user?.twoFactorEnabled || enabled) && (
                      <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full shrink-0">
                        <CheckCircle2 size={11} /> Activé
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-4">
                    {(user?.twoFactorEnabled || enabled) ? (
                      <p className="text-xs text-slate-500">
                        Votre compte est protégé par une vérification en deux étapes.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-slate-500 mb-3">
                          Renforcez la sécurité de votre compte. Un code temporaire vous sera demandé à chaque connexion.
                        </p>
                        <Button size="sm" variant="secondary" isLoading={setting2fa} icon={<QrCode size={14} />} onClick={() => setup2fa()}>
                          Configurer la 2FA
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Key size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Mot de passe</p>
                      <p className="text-xs text-slate-500">Modifiez votre mot de passe de connexion</p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <Button size="sm" variant="secondary" icon={<Key size={14} />}>Changer le mot de passe</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {section === 'Notifications' && <NotificationPreferencesSection />}

            {/* Abonnement */}
            {section === 'Abonnement' && isAdmin && (
              <SubscriptionSection currentPlan={(user?.organization?.subscriptionPlan ?? 'INDIVIDUEL') as SubscriptionPlan} />
            )}
          </div>
        </div>
      </main>

      {/* ── Bouton sphère flottant (mobile uniquement) ── */}
      <div className="md:hidden">
        {/* Overlay fermeture */}
        {menuOpen && (
          <div className="fixed inset-0 z-[58]" onClick={() => setMenuOpen(false)} />
        )}

        {/* Items du menu — apparaissent au-dessus de la sphère */}
        {menuOpen && (
          <div className="fixed bottom-24 right-5 z-[59] flex flex-col items-end gap-2">
            {SECTIONS.map(s => {
              const { icon: Icon } = SECTION_CONFIG[s];
              const active = section === s;
              return (
                <button
                  key={s}
                  onClick={() => { setSection(s); setMenuOpen(false); }}
                  className={cn(
                    'flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all',
                    active
                      ? 'text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  )}
                  style={active ? { backgroundColor: 'var(--color-brand)' } : undefined}
                >
                  <Icon size={14} />
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {/* La sphère */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Navigation paramètres"
          className="fixed bottom-6 right-5 z-[60] w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-90 hover:scale-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          style={{ background: '#0f1e38', boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)' }}
        >
          <div
            aria-hidden="true"
            style={{
              transition: 'transform 0.2s ease',
              transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
            className="motion-reduce:transition-none"
          >
            {menuOpen ? (
              <X size={20} className="text-white" strokeWidth={2.5} />
            ) : (
              /* Monogramme A — initiale ATAABA */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 20 L12 4 L20 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.2 14 H16.8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* 2FA QR Modal */}
      <Modal open={qrModal} onClose={() => setQrModal(false)} title="Configuration 2FA" size="sm">
        {qrData && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600">Scannez ce QR code avec Google Authenticator ou une app TOTP :</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrData.qrCode} alt="QR code 2FA" className="mx-auto w-48 h-48" />
            <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono break-all">
              {qrData.secret}
            </div>
            <FormField label="Code de vérification (6 chiffres)">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpToken}
                onChange={e => setTotpToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center tracking-widest font-mono"
                autoFocus
              />
            </FormField>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setQrModal(false)}>Annuler</Button>
              <Button onClick={() => enable2fa()} isLoading={enabling} disabled={totpToken.length !== 6} icon={<CheckCircle2 size={14} />}>
                Activer la 2FA
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
