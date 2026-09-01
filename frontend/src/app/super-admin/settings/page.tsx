'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { maintenanceApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FormField, Input } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import { User, Shield, Key, Save, Settings2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'profil' | 'securite' | 'systeme';

interface MaintenanceStatus {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  scheduledEnd?: string;
}

export default function SuperAdminSettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profil');
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profil',   label: 'Profil',   icon: User },
    { key: 'securite', label: 'Sécurité', icon: Key },
    { key: 'systeme',  label: 'Système',  icon: Settings2 },
  ];

  // Charger le status actuel
  useEffect(() => {
    if (tab === 'systeme') {
      fetchMaintenanceStatus();
    }
  }, [tab]);

  const fetchMaintenanceStatus = async () => {
    try {
      const { data } = await maintenanceApi.getStatus();
      setMaintenanceStatus(data);
    } catch (error) {
      toast.error('Impossible de récupérer le status');
    }
  };

  const toggleMaintenance = async () => {
    setLoading(true);
    try {
      const { data } = await maintenanceApi.toggle({
        maintenanceMode: !maintenanceStatus.maintenanceMode,
        maintenanceMessage: maintenanceStatus.maintenanceMessage,
      });

      setMaintenanceStatus(data);

      toast.success(
        data.maintenanceMode
          ? '🚧 Mode maintenance activé'
          : '✅ Mode maintenance désactivé',
      );
    } catch (error) {
      toast.error('Erreur lors du changement de status');
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-xs text-slate-600 mt-0.5">{user?.email}</p>
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

      {tab === 'systeme' && (
        <div className="space-y-4">
          {/* Mode Maintenance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <h3 className="text-base font-semibold text-slate-900">Mode Maintenance</h3>
                </div>
                <p className="text-sm text-slate-500">
                  Désactive temporairement l'accès à la plateforme pour tous les utilisateurs sauf les super administrateurs
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={toggleMaintenance}
                disabled={loading}
                className={cn(
                  'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                  maintenanceStatus.maintenanceMode ? 'bg-amber-500' : 'bg-slate-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    maintenanceStatus.maintenanceMode ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Status indicator */}
            {maintenanceStatus.maintenanceMode && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-sm font-medium text-amber-900">
                  Le site est actuellement en maintenance
                </p>
              </div>
            )}

            {/* Message personnalisé */}
            <FormField label="Message personnalisé (optionnel)">
              <textarea
                value={maintenanceStatus.maintenanceMessage || ''}
                onChange={(e) => setMaintenanceStatus({ ...maintenanceStatus, maintenanceMessage: e.target.value })}
                placeholder="Ex: Nous effectuons une mise à jour majeure. Retour prévu à 15h."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </FormField>

            {maintenanceStatus.maintenanceMode && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await maintenanceApi.toggle({
                        maintenanceMode: true,
                        maintenanceMessage: maintenanceStatus.maintenanceMessage,
                      });

                      toast.success('Message mis à jour');
                    } catch (error) {
                      toast.error('Erreur lors de la mise à jour');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  icon={<Save size={14} />}
                >
                  Mettre à jour le message
                </Button>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ À savoir</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les super administrateurs peuvent toujours accéder au site</li>
              <li>• Les utilisateurs verront une page d'information élégante</li>
              <li>• Les endpoints /health et /auth restent accessibles</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
