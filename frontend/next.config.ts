import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration optimisée pour production
  compress: true,
  poweredByHeader: false,

  // Proxy API calls to backend (évite problème cross-domain cookies)
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://firebrick-lyrebird-183958.hostingersite.com'
      : 'http://localhost:3001'; // ✅ Backend sur port 3001

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`, // ✅ Pas de /api prefix car backend utilise routes directes
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
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
