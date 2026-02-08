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
    // Use environment variable for API URL in production
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
