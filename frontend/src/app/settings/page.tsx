'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { FormField, Input } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { Shield, Key, User, Bell, CheckCircle2, QrCode, CreditCard, Check, Zap, MessageSquare, Users, FolderKanban, ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/lib/types';

const SECTIONS = ['Profil', 'Sécurité', 'Notifications', 'Abonnement'] as const;
type Section = typeof SECTIONS[number];

/* ─── Données des formules ────────────────────────────────────── */

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
    key: 'ESSENTIELLE',
    label: 'Essentielle',
    tagline: 'Pour démarrer simplement',
    color: 'bg-slate-50 border-slate-200',
    ring: 'ring-slate-300',
    limits: { plans: '1 plan actif', users: 'Jusqu\'à 5 utilisateurs' },
    features: [
      { label: 'Activités & check-lists', included: true },
      { label: 'Tableau de bord standard', included: true },
      { label: 'Alertes e-mail', included: true },
      { label: 'Exports PDF / Excel', included: true },
      { label: 'Suivi budgétaire', included: false },
      { label: 'Circuit de validation', included: false },
      { label: 'Gestion documentaire', included: false },
      { label: 'Rapports automatisés', included: false },
      { label: 'Accès partenaires / bailleurs', included: false },
    ],
  },
  {
    key: 'PROFESSIONNELLE',
    label: 'Professionnelle',
    tagline: 'Pour les équipes actives',
    color: 'bg-blue-50 border-blue-200',
    ring: 'ring-[#2563eb]',
    badge: 'Populaire',
    limits: { plans: 'Plusieurs plans', users: 'Jusqu\'à 20 utilisateurs' },
    features: [
      { label: 'Activités & check-lists', included: true },
      { label: 'Tableaux de bord avancés', included: true },
      { label: 'Alertes personnalisées', included: true },
      { label: 'Exports PDF / Excel', included: true },
      { label: 'Suivi budgétaire', included: true },
      { label: 'Circuit de validation', included: true },
      { label: 'Gestion documentaire', included: true },
      { label: 'Rapports automatisés', included: true },
      { label: 'Accès partenaires / bailleurs', included: false },
    ],
  },
  {
    key: 'ORGANISATION',
    label: 'Organisation',
    tagline: 'Pour les grandes structures',
    color: 'bg-indigo-50 border-indigo-200',
    ring: 'ring-indigo-400',
    limits: { plans: 'Plusieurs plans', users: 'Utilisateurs illimités' },
    features: [
      { label: 'Activités & check-lists', included: true },
      { label: 'Tableaux de bord personnalisés', included: true },
      { label: 'Alertes personnalisées', included: true },
      { label: 'Exports PDF / Excel', included: true },
      { label: 'Suivi budgétaire', included: true },
      { label: 'Circuit de validation', included: true },
      { label: 'Gestion documentaire', included: true },
      { label: 'Rapports automatisés', included: true },
      { label: 'Accès partenaires / bailleurs', included: true },
    ],
  },
  {
    key: 'SUR_MESURE',
    label: 'Sur mesure',
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
      { label: 'Maintenance annuelle', included: true },
      { label: 'SLA garanti', included: true },
      { label: 'Développements spécifiques', included: true },
      { label: 'Accès partenaires / bailleurs', included: true },
    ],
  },
];

const PLAN_ORDER: SubscriptionPlan[] = ['ESSENTIELLE', 'PROFESSIONNELLE', 'ORGANISATION', 'SUR_MESURE'];

function SubscriptionSection({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<PlanInfo | null>(null);
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const current = PLANS.find(p => p.key === currentPlan)!;

  const openUpgrade = (plan: PlanInfo) => { setTargetPlan(plan); setUpgradeModal(true); };

  // Couleurs par formule
  const ACCENT: Record<SubscriptionPlan, { from: string; to: string; text: string; dot: string }> = {
    ESSENTIELLE:     { from: 'from-slate-800',  to: 'to-slate-700',   text: 'text-slate-300', dot: 'bg-slate-400' },
    PROFESSIONNELLE: { from: 'from-[#0f1e38]',  to: 'to-[#1a3a6e]',  text: 'text-blue-300',  dot: 'bg-blue-400' },
    ORGANISATION:    { from: 'from-indigo-900', to: 'to-indigo-700',  text: 'text-indigo-300', dot: 'bg-indigo-400' },
    SUR_MESURE:      { from: 'from-amber-900',  to: 'to-amber-700',   text: 'text-amber-300', dot: 'bg-amber-400' },
  };
  const acc = ACCENT[currentPlan];

  return (
    <div className="space-y-5">

      {/* ── Bannière formule active ── */}
      <div className={cn('rounded-2xl bg-linear-to-br p-6 text-white relative overflow-hidden', acc.from, acc.to)}>
        {/* Cercles décoratifs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -right-2 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Formule active</p>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">{current.label}</h3>
              <p className={cn('text-sm mt-1', acc.text)}>{current.tagline}</p>
            </div>
            <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold', acc.text)}>
              <div className={cn('w-1.5 h-1.5 rounded-full', acc.dot)} />
              Actif
            </div>
          </div>

          {/* Limites */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
              <FolderKanban size={16} className="text-white/40 shrink-0" />
              <div>
                <p className="text-xs text-white/40">Plans d'action</p>
                <p className="text-sm font-semibold text-white">{current.limits.plans}</p>
              </div>
            </div>
            <div className="bg-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
              <Users size={16} className="text-white/40 shrink-0" />
              <div>
                <p className="text-xs text-white/40">Utilisateurs</p>
                <p className="text-sm font-semibold text-white">{current.limits.users}</p>
              </div>
            </div>
          </div>

          {/* Fonctionnalités incluses */}
          <div className="mt-4 flex flex-wrap gap-2">
            {current.features.filter(f => f.included).map(f => (
              <span key={f.label} className="flex items-center gap-1.5 text-xs text-white/70 bg-white/8 px-2.5 py-1 rounded-full">
                <Check size={10} className="text-green-400 shrink-0" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formules supérieures ── */}
      {currentPlan !== 'SUR_MESURE' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#2563eb]" />
            <p className="text-sm font-semibold text-slate-800">Évoluer vers une formule supérieure</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PLANS.filter(p => PLAN_ORDER.indexOf(p.key) > currentIndex).map((plan, i) => {
              const extras = plan.features.filter(
                f => f.included && !current.features.find(cf => cf.label === f.label && cf.included)
              );
              const isTop = i === 0;

              const CARD_STYLES: Record<SubscriptionPlan, { border: string; icon: string; btn: string }> = {
                ESSENTIELLE:     { border: 'border-slate-200', icon: 'text-slate-400', btn: '' },
                PROFESSIONNELLE: { border: 'border-[#2563eb]/40 bg-blue-50/50', icon: 'text-[#2563eb]', btn: '' },
                ORGANISATION:    { border: 'border-indigo-200 bg-indigo-50/40', icon: 'text-indigo-600', btn: '' },
                SUR_MESURE:      { border: 'border-amber-200 bg-amber-50/40', icon: 'text-amber-600', btn: '' },
              };
              const style = CARD_STYLES[plan.key];

              return (
                <div key={plan.key} className={cn(
                  'relative rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-5',
                  style.border
                )}>
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-5 text-xs font-bold bg-[#2563eb] text-white px-3 py-0.5 rounded-full shadow-sm">
                      {plan.badge}
                    </span>
                  )}

                  {/* Nom + tagline */}
                  <div className="sm:w-44 shrink-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Star size={13} className={cn('shrink-0', style.icon)} />
                      <p className="font-bold text-slate-900 text-sm">{plan.label}</p>
                    </div>
                    <p className="text-xs text-slate-500 ml-5">{plan.tagline}</p>
                    <div className="flex gap-3 mt-2 ml-5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <FolderKanban size={10} className="text-slate-400" />
                        {plan.limits.plans}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users size={10} className="text-slate-400" />
                        {plan.limits.users}
                      </span>
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div className="hidden sm:block w-px self-stretch bg-slate-200" />

                  {/* Ce qui s'ajoute */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Ce que vous gagnez</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {extras.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Tout ce qui précède, en mieux</span>
                      ) : extras.map(f => (
                        <span key={f.label} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Check size={11} className="text-green-500 shrink-0" />
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
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
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Star size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Vous bénéficiez de la formule maximale</p>
            <p className="text-xs text-slate-500 mt-0.5">Pour toute modification ou demande spécifique, contactez directement l'équipe ATAABA Pilot.</p>
          </div>
        </div>
      )}

      {/* Note de bas de page */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
        <MessageSquare size={14} className="text-slate-400 shrink-0" />
        <p className="text-xs text-slate-500">
          Pour réduire votre formule ou toute autre demande, contactez{' '}
          <span className="font-medium text-slate-700">support@ataaba.com</span>
        </p>
      </div>

      {/* ── Modal confirmation demande ── */}
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
              Notre équipe vous contactera sous 24h pour cadrer vos besoins.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Votre demande de passage à la formule <strong>{targetPlan?.label}</strong> sera
              transmise à l'équipe ATAABA Pilot. Vous recevrez une confirmation par e-mail sous 24h.
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

export default function SettingsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>('Profil');
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

  const SECTION_ICONS: Record<Section, React.ElementType> = {
    Profil: User, Sécurité: Shield, Notifications: Bell, Abonnement: CreditCard,
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Header title="Paramètres" subtitle="Gérez votre compte et vos préférences" />
      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="max-w-4xl flex flex-col md:flex-row gap-6">

          {/* Sidebar nav */}
          <nav className="md:w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {SECTIONS.map(s => {
                const Icon = SECTION_ICONS[s];
                return (
                  <button
                    key={s}
                    onClick={() => setSection(s)}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium transition-colors border-b border-slate-100 last:border-0',
                      section === s ? 'bg-[#0f1e38] text-white' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon size={16} />
                    {s}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {section === 'Profil' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
                <h2 className="text-sm font-semibold text-slate-900">Informations personnelles</h2>
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-[#0f1e38] flex items-center justify-center text-white text-xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {user?.role?.name}
                    </span>
                  </div>
                </div>
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
                <p className="text-xs text-slate-400">Pour modifier ces informations, contactez votre administrateur.</p>
              </div>
            )}

            {section === 'Sécurité' && (
              <div className="space-y-4">
                {/* 2FA */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={16} className="text-indigo-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Authentification à deux facteurs (2FA)</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">
                        Renforcez la sécurité de votre compte avec Google Authenticator ou une application TOTP compatible.
                      </p>
                      {(user?.twoFactorEnabled || enabled) ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 size={16} />
                          <span className="text-sm font-medium">2FA activé sur ce compte</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={setting2fa}
                          icon={<QrCode size={14} />}
                          onClick={() => setup2fa()}
                        >
                          Configurer la 2FA
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Change password placeholder */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Key size={16} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Mot de passe</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Modifiez votre mot de passe de connexion.</p>
                  <Button size="sm" variant="secondary" icon={<Key size={14} />}>Changer le mot de passe</Button>
                </div>
              </div>
            )}

            {section === 'Notifications' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
                <h2 className="text-sm font-semibold text-slate-900">Préférences de notification</h2>
                {[
                  { label: 'Activités en retard', desc: 'Recevoir une alerte lorsque des activités dépassent leur échéance', enabled: true },
                  { label: 'Validations en attente', desc: 'Notifier lors qu\'une activité attend votre validation', enabled: true },
                  { label: 'Dépassement budgétaire', desc: 'Alerter en cas de dépassement du budget prévu', enabled: true },
                  { label: 'Rapport hebdomadaire', desc: 'Résumé hebdomadaire des activités de l\'organisation', enabled: false },
                  { label: 'Documents ajoutés', desc: 'Notification lors de l\'ajout de documents', enabled: false },
                ].map(item => (
                  <div key={item.label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#2563eb] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {section === 'Abonnement' && (
              <SubscriptionSection currentPlan={(user?.organization?.subscriptionPlan ?? 'ESSENTIELLE') as SubscriptionPlan} />
            )}
          </div>
        </div>
      </main>

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
              <Button
                onClick={() => enable2fa()}
                loading={enabling}
                disabled={totpToken.length !== 6}
                icon={<CheckCircle2 size={14} />}
              >
                Activer la 2FA
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
