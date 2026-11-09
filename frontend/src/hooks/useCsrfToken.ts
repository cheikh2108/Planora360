'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

/**
 * Obtient le cookie CSRF au chargement de l'application s'il n'existe pas encore.
 * Il est exigé (en-tête X-CSRF-Token) pour toutes les requêtes mutantes.
 */
export function useCsrfToken() {
  useEffect(() => {
    if (document.cookie.split(/;\s*/).some((c) => c.startsWith('csrf-token='))) return;
    api.get('/auth/csrf').catch(() => {
      /* nouvel essai implicite au prochain chargement ; la requête mutante échouera en 403 */
    });
  }, []);
}
