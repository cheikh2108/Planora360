import { API_BASE_URL } from './api-constants';

/**
 * URL utilisable dans le navigateur pour un fichier renvoyé par l'API.
 *
 * Le backend stocke des clés et renvoie des chemins stables « /api/files/... » (servis après
 * contrôle d'accès, cookie de session requis). Si le frontend appelle un backend sur une autre
 * origine (NEXT_PUBLIC_API_URL absolue), le chemin est préfixé par cette origine.
 * Les URL absolues (http, https, blob, data) sont renvoyées telles quelles.
 */
export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/api/files/${url}`;
  if (/^https?:/i.test(API_BASE_URL)) {
    const origin = new URL(API_BASE_URL).origin;
    return `${origin}${path}`;
  }
  return path;
}
