'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { HelpProvider } from '@/contexts/help-context';
import { ToastProvider } from '@/components/ui/toast';
import { HelpSidebar } from '@/components/help/help-sidebar';
import { FloatingHelpButton } from '@/components/help/floating-help-button';
import { PostHogProvider } from '@/lib/posthog-provider';
import { Toaster } from 'sonner';
import { useCsrfToken } from '@/hooks/useCsrfToken';

function CSRFProvider({ children }: { children: React.ReactNode }) {
  useCsrfToken();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
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
