import DOMPurify from 'dompurify';

/**
 * Nettoie du HTML avant injection (dangerouslySetInnerHTML) : scripts, gestionnaires
 * d'événements et URL javascript: sont retirés. Côté serveur (pas de DOM), le contenu est
 * réduit à du texte.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
