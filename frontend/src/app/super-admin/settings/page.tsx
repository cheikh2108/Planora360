'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { FormField, Input } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import { User, Shield, Key, Bell, Save } from 'lucide-react';

type Tab = 'profil' | 'securite';

export default function SuperAdminSettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profil');

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profil',   label: 'Profil',   icon: User },
    { key: 'securite', label: 'Sécurité', icon: Key },
  ];

  return (
    <main className="px-4 md:px-8 py-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gérez votre compte super administrateur</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profil' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-xl font-bold text-[#0a1628]">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-amber-600 font-medium">Super administrateur</p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <FormField label="Prénom">
              <Input defaultValue={user?.firstName} placeholder="Prénom" />
            </FormField>
            <FormField label="Nom">
              <Input defaultValue={user?.lastName} placeholder="Nom" />
            </FormField>
          </div>
          <FormField label="Adresse email">
            <Input type="email" defaultValue={user?.email} />
          </FormField>

          <div className="flex justify-end pt-2">
            <Button icon={<Save size={14} />}>Enregistrer</Button>
          </div>
        </div>
      )}

      {tab === 'securite' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <Shield size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-slate-700">
              En tant que super administrateur, utilisez un mot de passe fort et activez la 2FA.
            </p>
          </div>

          <FormField label="Mot de passe actuel">
            <Input type="password" placeholder="••••••••" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nouveau mot de passe">
              <Input type="password" placeholder="••••••••" />
            </FormField>
            <FormField label="Confirmer">
              <Input type="password" placeholder="••••••••" />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <Button icon={<Key size={14} />}>Changer le mot de passe</Button>
          </div>
        </div>
      )}
    </main>
  );
}
