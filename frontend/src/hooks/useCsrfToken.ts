'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

/**
 * Hook qui récupère et définit automatiquement le token CSRF au chargement de l'app
 * Le token est nécessaire pour toutes les requêtes mutantes (POST, PATCH, DELETE)
 */
export function useCsrfToken() {
  useEffect(() => {
    // Vérifier si le cookie CSRF existe déjà
    const hasCSRF = document.cookie.includes('csrf-token=');
    console.log('[CSRF] Cookie check:', { hasCSRF, allCookies: document.cookie });

    if (!hasCSRF) {
      console.log('[CSRF] Fetching new token...');
      // Récupérer un nouveau token CSRF
      api.get('/auth/csrf')
        .then(res => {
          console.log('[CSRF] Token fetched successfully:', res.data);
          console.log('[CSRF] Cookies after fetch:', document.cookie);
        })
        .catch((err) => {
          console.error('[CSRF] Failed to fetch token:', err);
        });
    } else {
      console.log('[CSRF] Token already exists in cookie');
    }
  }, []);
}
