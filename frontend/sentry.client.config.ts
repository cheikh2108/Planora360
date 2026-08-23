import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Client-Side Configuration
 * Runs in the browser
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Replay sampling rates
  // Session Replay helps you see what users did before an error
  replaysSessionSampleRate: 0.1, // 10% of normal sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Transaction sampling (performance monitoring)
  tracesSampleRate: 0.5, // 50% to stay within free tier

  // Ignore common browser errors that we can't fix
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Random plugins/extensions
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    // Expected navigation errors
    'NavigationDuplicated',
  ],

  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Dev]', event.exception?.values?.[0]?.value);
      return null;
    }

    // Filter out localhost errors (dev proxies, local API calls)
    if (event.request?.url?.includes('localhost')) {
      return null;
    }

    return event;
  },

  // Enhanced debugging in development
  debug: process.env.NODE_ENV === 'development',

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and input fields by default
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
