import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations for faster dev startup
  experimental: {
    // Optimize bundling
    optimizePackageImports: ['@dnd-kit/core', '@dnd-kit/sortable', '@radix-ui/react-select', 'lucide-react'],
  },
  // Webpack optimizations
  webpack: (config, { dev }) => {
    // Fix for next-auth/react module resolution issue
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth/react': require.resolve('next-auth/react'),
    };
    
    if (dev) {
      // Disable webpack caching in development to prevent corrupted cache issues
      config.cache = false;

      // Also disable filesystem cache
      config.infrastructureLogging = {
        level: 'error',
      };

      // Use native file watching instead of polling for better performance
      config.watchOptions = {
        // Remove polling - use native file system events instead
        // poll: 1000,  // This was causing high resource usage
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules',
          '**/.next',
          '**/prisma/dev.db',
          '**/coverage',
          '**/.git',
          '**/.vercel',
          '**/.swc',
          '**/.vscode',
          '**/dist',
          '**/build',
          '**/.jest-cache',
          '**/tsconfig.tsbuildinfo',
          '**/.eslintcache'
        ],
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
