'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import api from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { FormField, Input } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import {
  Shield, Key, User, Bell, CheckCircle2, QrCode, CreditCard,
  Check, Zap, MessageSquare, Users, FolderKanban, ArrowRight, Star,
  LayoutGrid, X, Palette,
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
    key: 'DECOUVERTE',
    label: 'Découverte',
    tagline: 'Essai gratuit 30 jours',
    color: 'bg-emerald-50 border-emerald-200',
    ring: 'ring-emerald-300',
    badge: '30 jours gratuits',
    limits: { plans: '2 plans actifs', users: "Jusqu'à 5 utilisateurs" },
    features: [
      { label: 'Activités & check-lists', included: true },
      { label: 'Tableau de bord standard', included: true },
      { label: 'Alertes e-mail', included: false },
      { label: 'Exports PDF / Excel', included: false },
      { label: 'Suivi budgétaire', included: false },
      { label: 'Circuit de validation', included: false },
    ],
  },
  {
    key: 'PROFESSIONNELLE',
    label: 'Professionnelle',
    tagline: 'Pour les équipes actives',
    color: 'bg-blue-50 border-blue-200',
    ring: 'ring-[#2563eb]',
    badge: 'Populaire',
    limits: { plans: 'Plans illimités', users: "Jusqu'à 50 utilisateurs" },
    features: [
      { label: 'Activités & check-lists', included: true },
      { label: 'Tableaux de bord avancés', included: true },
      { label: 'Alertes personnalisées', included: true },
      { label: 'Exports PDF / Excel', included: true },
      { label: 'Suivi budgétaire', included: true },
      { label: 'Circuit de validation', included: true },
      { label: 'Gestion documentaire', included: true },
      { label: 'Rapports automatisés', included: true },
    ],
  },
  {
    key: 'SUR_MESURE',
    label: 'Entreprise',
    tagline: 'Hébergement dédié & intégrations',
    color: 'bg-amber-50 border-amber-200',
    ring: 'ring-amber-400',
    limits: { plans: 'Illimité', users: 'Illimité' },
    features: [
      { label: 'Tout inclus', included: true },
      { label: 'Hébergement dédié', included: true },
      { label: 'Intégrations (Power BI, Kobo, DHIS2…)', included: true },
      { label: 'Migration de données', included: true },
      { label: 'Accompagnement & formation', included: true },
      { label: 'SLA garanti', included: true },
      { label: 'Développements spécifiques', included: true },
    ],
  },
];

const PLAN_ORDER: SubscriptionPlan[] = ['DECOUVERTE', 'PROFESSIONNELLE', 'SUR_MESURE'];

/* ─── SubscriptionSection ────────────────────────────────────── */

function SubscriptionSection({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<PlanInfo | null>(null);
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const current = PLANS.find(p => p.key === currentPlan)!;

  const openUpgrade = (plan: PlanInfo) => { setTargetPlan(plan); setUpgradeModal(true); };

  const ACCENT: Record<SubscriptionPlan, { from: string; to: string; text: string; dot: string }> = {
    DECOUVERTE:      { from: 'from-emerald-800', to: 'to-emerald-700', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    PROFESSIONNELLE: { from: 'from-[#0f1e38]',  to: 'to-[#1a3a6e]',  text: 'text-blue-300',    dot: 'bg-blue-400' },
    SUR_MESURE:      { from: 'from-amber-900',  to: 'to-amber-700',   text: 'text-amber-300',   dot: 'bg-amber-400' },
  };
  const acc = ACCENT[currentPlan];

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
              <p className={cn('text-xs md:text-sm mt-1', acc.text)}>{current.tagline}</p>
            </div>
            <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold shrink-0', acc.text)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', acc.dot)} />
              Actif
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-white/8 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <FolderKanban size={13} className="text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40">Plans d'action</p>
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

      {/* Formules supérieures */}
      {currentPlan !== 'SUR_MESURE' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-[#2563eb]" />
            <p className="text-sm font-semibold text-slate-800">Évoluer vers une formule supérieure</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {PLANS.filter(p => PLAN_ORDER.indexOf(p.key) > currentIndex).map(plan => {
              const extras = plan.features.filter(
                f => f.included && !current.features.find(cf => cf.label === f.label && cf.included)
              );
              const CARD_STYLES: Record<SubscriptionPlan, { border: string; icon: string }> = {
                DECOUVERTE:      { border: 'border-emerald-200 bg-emerald-50/40', icon: 'text-emerald-600' },
                PROFESSIONNELLE: { border: 'border-[#2563eb]/40 bg-blue-50/50',  icon: 'text-[#2563eb]' },
                SUR_MESURE:      { border: 'border-amber-200 bg-amber-50/40',     icon: 'text-amber-600' },
              };
              const style = CARD_STYLES[plan.key];
              return (
                <div key={plan.key} className={cn('relative rounded-2xl border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4', style.border)}>
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-4 text-[11px] font-bold bg-[#2563eb] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      {plan.badge}
                    </span>
                  )}
                  <div className="sm:w-44 shrink-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Star size={12} className={cn('shrink-0', style.icon)} />
                      <p className="font-bold text-slate-900 text-sm">{plan.label}</p>
                    </div>
                    <p className="text-xs text-slate-500 ml-[22px]">{plan.tagline}</p>
                    <div className="flex gap-3 mt-1.5 ml-[22px]">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <FolderKanban size={9} className="text-slate-400" />{plan.limits.plans}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users size={9} className="text-slate-400" />{plan.limits.users}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px self-stretch bg-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Ce que vous gagnez</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {extras.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Tout ce qui précède, en mieux</span>
                      ) : extras.map(f => (
                        <span key={f.label} className="flex items-center gap-1 text-xs text-slate-700">
                          <Check size={10} className="text-green-500 shrink-0" />{f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {plan.key === 'SUR_MESURE' ? (
                      <Button size="sm" variant="secondary" icon={<MessageSquare size={13} />} onClick={() => openUpgrade(plan)}>
                        Nous contacter
                      </Button>
                    ) : (
                      <Button size="sm" icon={<ArrowRight size={13} />} onClick={() => openUpgrade(plan)}>
                        Choisir
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentPlan === 'SUR_MESURE' && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Star size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Formule maximale active</p>
            <p className="text-xs text-slate-500 mt-0.5">Pour toute modification, contactez l'équipe ATAABA Pilot.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <MessageSquare size={13} className="text-slate-400 shrink-0" />
        <p className="text-xs text-slate-500">
          Pour réduire votre formule ou toute autre demande :{' '}
          <span className="font-medium text-slate-700">support@ataaba.com</span>
        </p>
      </div>

      <Modal open={upgradeModal} onClose={() => setUpgradeModal(false)} title="" size="sm">
        <div className="space-y-4">
          <div className={cn('rounded-xl p-4 flex items-center gap-3',
            targetPlan?.key === 'SUR_MESURE' ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50 border border-blue-100'
          )}>
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Star size={18} className={targetPlan?.key === 'SUR_MESURE' ? 'text-amber-500' : 'text-[#2563eb]'} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{targetPlan?.label}</p>
              <p className="text-xs text-slate-500">{targetPlan?.tagline}</p>
            </div>
          </div>
          {targetPlan?.key === 'SUR_MESURE' ? (
            <p className="text-sm text-slate-600">
              La formule <strong>Sur mesure</strong> requiert une configuration personnalisée.
              Notre équipe vous contactera sous 24h.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Votre demande de passage à la formule <strong>{targetPlan?.label}</strong> sera
              transmise à l'équipe ATAABA Pilot. Confirmation par e-mail sous 24h.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setUpgradeModal(false)}>Annuler</Button>
            <Button icon={<MessageSquare size={14} />} onClick={() => setUpgradeModal(false)}>
              Envoyer la demande
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────────── */

export default function SettingsPage() {
  const { user, setBrandColor } = useAuth();
  const isAdmin = ['Administrateur', 'Super administrateur'].includes(user?.role?.name ?? '');
  const SECTIONS = ALL_SECTIONS.filter(s => s !== 'Abonnement' || isAdmin);
  const [section, setSection] = useState<Section>('Profil');
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

  const { mutate: saveBrandColor, isPending: savingColor } = useMutation({
    mutationFn: (color: string) => api.patch('/organizations/my/brand-color', { brandColor: color }),
    onSuccess: (_, color) => {
      setBrandColor(color);
      setColorSaved(true);
      setTimeout(() => setColorSaved(false), 2000);
    },
  });

  const PRESET_COLORS = ['#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#16a34a','#0891b2','#0f172a','#64748b','#b45309'];

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
                      <p className={cn('text-[11px] truncate', active ? 'text-white/50' : 'text-slate-400')}>{desc}</p>
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
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: 'radial-gradient(circle at 35% 35%, #2a3f5f, #0a1628)', boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
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
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Informations personnelles</p>
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
                  <p className="text-xs text-slate-400 pt-1">Pour modifier ces informations, contactez votre administrateur.</p>
                </div>
              </div>
            )}

            {/* Apparence */}
            {section === 'Apparence' && (
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
                          onClick={() => setBrandColorLocal(c)}
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
                          onChange={e => setBrandColorLocal(e.target.value)}
                          className="w-14 h-14 -translate-x-2 -translate-y-2 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={brandColorLocal}
                        onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setBrandColorLocal(e.target.value)}
                        className="w-28 h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none"
                        maxLength={7}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      loading={savingColor}
                      onClick={() => saveBrandColor(brandColorLocal)}
                      disabled={brandColorLocal.length !== 7}
                    >
                      {colorSaved ? <><CheckCircle2 size={14} /> Enregistré</> : 'Appliquer'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setBrandColorLocal(user?.organization?.brandColor ?? '#2563eb')}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
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
                        <Button size="sm" variant="secondary" loading={setting2fa} icon={<QrCode size={14} />} onClick={() => setup2fa()}>
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
            {section === 'Notifications' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Préférences de notification</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: 'Activités en retard',     desc: 'Alerte lorsque des activités dépassent leur échéance',            enabled: true  },
                    { label: 'Validations en attente',  desc: 'Notification quand une activité attend votre validation',          enabled: true  },
                    { label: 'Dépassement budgétaire',  desc: 'Alerte en cas de dépassement du budget prévu',                    enabled: true  },
                    { label: 'Rapport hebdomadaire',    desc: 'Résumé hebdomadaire des activités de l\'organisation',             enabled: false },
                    { label: 'Documents ajoutés',       desc: 'Notification lors de l\'ajout de documents',                      enabled: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#2563eb] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abonnement */}
            {section === 'Abonnement' && isAdmin && (
              <SubscriptionSection currentPlan={(user?.organization?.subscriptionPlan ?? 'DECOUVERTE') as SubscriptionPlan} />
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
                  style={active ? {
                    background: 'radial-gradient(circle at 35% 30%, #1e3560, #0a1628)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                  } : undefined}
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
              <Button onClick={() => enable2fa()} loading={enabling} disabled={totpToken.length !== 6} icon={<CheckCircle2 size={14} />}>
                Activer la 2FA
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
