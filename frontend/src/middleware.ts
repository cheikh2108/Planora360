import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware Next.js - Check maintenance mode
 *
 * S'exécute sur TOUTES les requêtes et redirige vers /maintenance
 * si le backend est en mode maintenance.
 *
 * Bypass automatique pour :
 * - La page /maintenance elle-même
 * - Les ressources statiques (_next, favicon, etc.)
 * - Les super admins (cookie avec role info)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ne jamais bloquer la page maintenance elle-même
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  // 2. Ne pas bloquer les routes admin (déjà protégées par auth)
  // Les super admins doivent pouvoir accéder aux settings pour désactiver la maintenance
  if (
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next();
  }

  // 3. Ne pas bloquer les assets statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // fichiers avec extension (favicon.ico, etc.)
  ) {
    return NextResponse.next();
  }

  try {
    // 3. Check maintenance status via API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/maintenance/status`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      // Timeout de 2s pour ne pas ralentir les requests
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      // Si l'API ne répond pas, laisser passer (éviter de bloquer tout le site)
      return NextResponse.next();
    }

    const data = await response.json();

    // 4. Si pas en maintenance, laisser passer
    if (!data.maintenanceMode) {
      return NextResponse.next();
    }

    // 5. Rediriger vers la page maintenance
    // Note: On ne peut pas vérifier le rôle ici car le token est dans localStorage (pas accessible côté serveur)
    // La page /maintenance fera la vérification côté client et redirigera les super admins

    // 6. Rediriger vers la page maintenance
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);

  } catch (error) {
    // En cas d'erreur (timeout, network), ne pas bloquer l'accès
    console.error('[Middleware] Maintenance check failed:', error);
    return NextResponse.next();
  }
}

// Configuration : appliquer sur toutes les routes sauf les assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by backend)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
