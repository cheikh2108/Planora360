// Load .env BEFORE anything else
import { config } from 'dotenv';
config(); // This loads .env file into process.env

import * as Sentry from '@sentry/nestjs';

/**
 * Sentry Initialization
 * Must be imported before any other modules
 *
 * Free tier limits:
 * - 5K errors/month
 * - 10K transactions/month
 * - 90 days retention
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Sample rate for error tracking (100% in free tier, can reduce if needed)
  sampleRate: 1.0,

  // Transaction sampling for performance monitoring
  // Set to 0.5 (50%) to stay within free tier limits
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.5'),

  // Profiling sampling (optional, very low rate for free tier)
  profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),

  integrations: [
    // Add custom integrations here if needed
  ],

  // Ignore common non-critical errors
  ignoreErrors: [
    // Browser errors that shouldn't reach backend
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // Expected auth failures
    'UnauthorizedException',
    // Rate limiting is expected
    'ThrottlerException',
  ],

  // Filter sensitive data
  beforeSend(event, hint) {
    // Don't send events in development (save quota)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Dev] Event blocked (development mode):', event.exception?.values?.[0]?.value || event.message);
      return null;
    }

    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    // Remove sensitive query params
    if (event.request?.query_string && typeof event.request.query_string === 'string') {
      const sensitiveParams = ['token', 'password', 'secret', 'apiKey'];
      const hasQueryString = event.request.query_string as string;

      for (const param of sensitiveParams) {
        if (hasQueryString.includes(param)) {
          event.request.query_string = '[FILTERED]';
          break;
        }
      }
    }

    return event;
  },

  // Tag all events with app metadata
  initialScope: {
    tags: {
      app: 'action-pilot-backend',
      runtime: 'node',
    },
  },
});
