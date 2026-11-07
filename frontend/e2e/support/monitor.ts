import { Page, TestInfo } from '@playwright/test';

/**
 * Surveille une page pendant un test : erreurs JavaScript non capturées,
 * erreurs console et réponses 5xx de l'API.
 * Les appels vers des services tiers (Sentry, PostHog, polices) sont ignorés.
 */
export interface PageHealth {
  pageErrors: string[];
  consoleErrors: string[];
  serverErrors: string[];
  clientErrors: string[];
  /** Appels qui contournent le client API (fetch('/api/...') codé en dur). */
  hardcodedApiCalls: string[];
}

const THIRD_PARTY = /sentry\.io|posthog\.com|fonts\.g(oogleapis|static)\.com|googletagmanager/;

export function monitor(page: Page): PageHealth {
  const health: PageHealth = { pageErrors: [], consoleErrors: [], serverErrors: [], clientErrors: [], hardcodedApiCalls: [] };

  page.on('pageerror', (err) => health.pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const location = msg.location()?.url ?? '';
    if (THIRD_PARTY.test(text) || THIRD_PARTY.test(location)) return;
    // Les erreurs réseau sont déjà comptées via les réponses
    if (/Failed to load resource/.test(text)) return;
    health.consoleErrors.push(text.slice(0, 300));
  });
  const apiOrigin = new URL(process.env.E2E_API_URL ?? 'http://localhost:3000/api').origin;
  page.on('response', (res) => {
    const url = res.url();
    if (THIRD_PARTY.test(url) || !url.includes('/api/')) return;
    const status = res.status();
    const label = `${res.request().method()} ${url.replace(/^https?:\/\/[^/]+/, '')} → ${status}`;
    // Appel "/api/..." relatif envoyé au serveur Next au lieu de l'API configurée (fetch codé en dur)
    if (new URL(url).origin !== apiOrigin) {
      health.hardcodedApiCalls.push(label);
      return;
    }
    if (status >= 500) health.serverErrors.push(label);
    else if (status >= 400 && status !== 401) health.clientErrors.push(label);
  });

  return health;
}

/** Joint un résumé de santé au rapport Playwright. */
export async function attachHealth(testInfo: TestInfo, health: PageHealth) {
  await testInfo.attach('sante-page.json', {
    body: JSON.stringify(health, null, 2),
    contentType: 'application/json',
  });
}

/** Textes affichés par Next.js / React en cas de plantage de rendu. */
export const CRASH_TEXT = /Application error|Unhandled Runtime Error|Something went wrong|client-side exception|Une erreur est survenue lors du rendu/i;
