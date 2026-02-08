/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@opsuna/shared'],

  // Optimize heavy package imports (tree-shaking)
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-slot',
      'mermaid',
      '@codesandbox/sandpack-react',
    ],
  },

  // Empty turbopack config to silence the webpack warning
  turbopack: {},

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
