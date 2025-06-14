import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [],
    unoptimized: true,
  },
  typescript: {
    // !! WARN !!
    // During deployment, type errors can be treated as warnings
    ignoreBuildErrors: true,
  },
  eslint: {
    // During deployment, lint errors can be treated as warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
