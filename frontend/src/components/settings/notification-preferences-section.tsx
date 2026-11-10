'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, notificationsApi } from '@/lib/api';
import type { NotificationPreferences } from '@/lib/types';

/** Uniquement les e-mails réellement envoyés par la plateforme. */
const ITEMS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'validationRequests', label: 'Validations en attente', desc: 'Quand une activité attend votre validation' },
  { key: 'validationResults', label: 'Résultat de validation', desc: 'Quand une de vos activités est approuvée ou rejetée' },
  { key: 'overdueActivities', label: 'Activités en retard', desc: 'Quand une de vos activités dépasse son échéance (un seul e-mail)' },
  { key: 'upcomingDeadlines', label: 'Échéances proches', desc: 'Rappel chaque matin pendant les 3 jours avant l’échéance' },
];

const QUERY_KEY = ['notification-preferences'];

export function NotificationPreferencesSection() {
  const queryClient = useQueryClient();
  const { data: prefs, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => (await notificationsApi.getPreferences()).data,
  });

  const update = useMutation({
    mutationFn: (change: Partial<NotificationPreferences>) => notificationsApi.updatePreferences(change),
    // Mise à jour optimiste : l'interrupteur bascule immédiatement, et revient en cas d'erreur
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationPreferences>(QUERY_KEY);
      if (previous) queryClient.setQueryData(QUERY_KEY, { ...previous, ...change });
      return { previous };
    },
    onError: (_err, _change, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous);
    },
    onSuccess: (res) => queryClient.setQueryData(QUERY_KEY, res.data),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">E-mails de notification</p>
        <p className="text-xs text-slate-500 mt-1">
          Les notifications dans l’application (cloche) restent toujours actives. Ces réglages ne concernent que les e-mails.
        </p>
      </div>

      {isError ? (
        <p className="px-5 py-4 text-sm text-red-600" role="alert">Impossible de charger vos préférences.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {ITEMS.map((item) => {
            const id = `notif-pref-${item.key}`;
            return (
              <label key={item.key} htmlFor={id} className="flex items-center justify-between gap-4 px-5 py-3.5 cursor-pointer">
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                  <span className="block text-xs text-slate-600 mt-0.5 leading-snug">{item.desc}</span>
                </span>
                <span className="relative inline-flex items-center shrink-0">
                  <input
                    id={id}
                    type="checkbox"
                    role="switch"
                    className="sr-only peer"
                    disabled={isLoading || !prefs}
                    checked={prefs?.[item.key] ?? false}
                    onChange={(e) => update.mutate({ [item.key]: e.target.checked })}
                  />
                  <span
                    aria-hidden
                    className="block w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-[#2563eb] peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563eb]/40 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"
                  />
                </span>
              </label>
            );
          })}
        </div>
      )}

      {update.isError && (
        <p className="px-5 py-3 border-t border-slate-100 text-xs text-red-600" role="alert">
          {getErrorMessage(update.error, 'Enregistrement impossible, réessayez.')}
        </p>
      )}
    </div>
  );
}
