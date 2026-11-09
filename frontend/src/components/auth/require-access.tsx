'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { canAccess, type AccessKey } from '@/lib/access';

/**
 * Réserve une page aux rôles autorisés : sans droit, redirection vers le tableau de bord
 * (ou la connexion), sans afficher le contenu le temps de la vérification.
 */
export function RequireAccess({ access, children }: { access: AccessKey; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = canAccess(user, access);

  useEffect(() => {
    if (loading || allowed) return;
    router.replace(user ? '/dashboard' : '/auth/login');
  }, [loading, allowed, user, router]);

  if (loading || !allowed) return null;
  return <>{children}</>;
}
