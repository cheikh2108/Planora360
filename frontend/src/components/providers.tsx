'use client';

import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { HelpProvider } from '@/contexts/help-context';
import { ToastProvider } from '@/components/ui/toast';
import { HelpSidebar } from '@/components/help/help-sidebar';
import { FloatingHelpButton } from '@/components/help/floating-help-button';
import { PostHogProvider } from '@/lib/posthog-provider';
import { Toaster, toast } from 'sonner';
import { getErrorMessage } from '@/lib/api';
import { useCsrfToken } from '@/hooks/useCsrfToken';

function CSRFProvider({ children }: { children: React.ReactNode }) {
  useCsrfToken();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    // Filet de sécurité : toute mutation sans gestion d'erreur propre affiche le message renvoyé
    // (déjà traduit par le client API) au lieu d'échouer en silence.
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.options.onError) return;
        toast.error(getErrorMessage(error, 'L\'opération a échoué. Veuillez réessayer.'));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Pas de nouvel essai sur une erreur client (droits, ressource absente, validation)
        retry: (failureCount, error) => {
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 1;
        },
      },
    },
  }));

  return (
    <PostHogProvider>
      <QueryClientProvider client={client}>
        <CSRFProvider>
          <AuthProvider>
            <ToastProvider>
              <HelpProvider>
                {children}
                <HelpSidebar />
                <FloatingHelpButton />
                <Toaster position="top-right" />
              </HelpProvider>
            </ToastProvider>
          </AuthProvider>
        </CSRFProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
