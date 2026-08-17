import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration optimisée pour production
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
