import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge Runtime Configuration
 * Runs in Vercel Edge Functions / Middleware
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Transaction sampling
  tracesSampleRate: 0.5,

  // Don't send events in development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
