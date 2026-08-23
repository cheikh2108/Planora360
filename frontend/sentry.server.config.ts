import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Server-Side Configuration
 * Runs in Next.js server (API routes, server components, getServerSideProps)
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Transaction sampling
  tracesSampleRate: 0.5,

  // Filter sensitive server-side data
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Server Dev]', event.exception?.values?.[0]?.value);
      return null;
    }

    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    // Remove sensitive cookies
    if (event.request?.cookies) {
      Object.keys(event.request.cookies).forEach(key => {
        if (key.toLowerCase().includes('token') || key.toLowerCase().includes('session')) {
          delete event.request!.cookies![key];
        }
      });
    }

    return event;
  },

  // Enhanced debugging in development
  debug: process.env.NODE_ENV === 'development',
});
