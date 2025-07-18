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
  // Performance optimizations for faster dev startup
  experimental: {
    // Optimize bundling
    optimizePackageImports: ['@dnd-kit/core', '@dnd-kit/sortable', '@radix-ui/react-select', 'lucide-react'],
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster rebuilds in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next', '**/prisma/dev.db'],
      };
      
      // Reduce memory usage
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    return config;
  },
  // Dev-specific optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Reduce startup time by only transpiling what's needed
    transpilePackages: [],
  }),
};

export default nextConfig;
