'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // On gère manuellement les pageviews
        capture_pageleave: true,
        autocapture: false, // On capture manuellement les événements importants

        // Session Replay - Enregistrement vidéo des sessions
        // Le simple fait de définir session_recording l'active automatiquement
        session_recording: {
          maskAllInputs: true, // Masque tous les champs de formulaire (sécurité)
          maskTextSelector: '[data-private]', // Masque les éléments avec data-private
          recordCrossOriginIframes: false, // Sécurité : pas d'enregistrement d'iframes externes
        },
      });
    } catch (error) {
      // PostHog bloqué par adblocker ou autre erreur → ignore silencieusement
      console.warn('[PostHog] Failed to initialize (likely blocked by adblocker):', error);
    }
  }
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      try {
        let url = window.origin + pathname;
        if (searchParams && searchParams.toString()) {
          url += `?${searchParams.toString()}`;
        }
        posthog.capture('$pageview', {
          $current_url: url,
        });
      } catch (error) {
        // PostHog bloqué → ignore silencieusement
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

// Export PostHog instance for use in components
export { posthog };
