'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { HelpProvider } from '@/contexts/help-context';
import { HelpSidebar } from '@/components/help/help-sidebar';
import { FloatingHelpButton } from '@/components/help/floating-help-button';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <HelpProvider>
          {children}
          <HelpSidebar />
          <FloatingHelpButton />
        </HelpProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
