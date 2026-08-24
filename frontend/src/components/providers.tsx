'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { HelpProvider } from '@/contexts/help-context';
import { ToastProvider } from '@/components/ui/toast';
import { HelpSidebar } from '@/components/help/help-sidebar';
import { FloatingHelpButton } from '@/components/help/floating-help-button';
import { PostHogProvider } from '@/lib/posthog-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  return (
    <PostHogProvider>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <ToastProvider>
            <HelpProvider>
              {children}
              <HelpSidebar />
              <FloatingHelpButton />
            </HelpProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
