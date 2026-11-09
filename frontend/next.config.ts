import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

/**
 * Backend vers lequel /api est relayé (même origine pour le navigateur : cookies httpOnly sans
 * configuration cross-domain). À définir par environnement ; par défaut, le backend local.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

/** En-têtes de sécurité appliqués à toutes les pages. */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  // Les fichiers sont servis par l'API (/api/files/..., accès contrôlé) : plus de /uploads public
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`, // Backend a globalPrefix 'api'
      },
    ];
  },
};

// Configuration Sentry
const sentryWebpackPluginOptions = {
  // Auth token for uploading source maps (optionnel, uniquement pour production)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Organization and project in Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Silent mode (less logs during build)
  silent: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Hide source maps from public (security)
  hideSourceMaps: true,

  // Upload source maps automatically during build
  // Set to false if you prefer manual upload or want faster dev builds
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
};

// Wrap Next.js config with Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
