import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Configuration pour Hostinger
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
