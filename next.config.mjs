let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  reactStrictMode: true,

  // Force all pages to be client-side rendered in production
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // Add custom webpack config to avoid SSR issues
  webpack: (config, { isServer, dev }) => {
    // If not in development and it's the server build
    if (!dev && isServer) {
      // Replace React server components with empty shells
      config.resolve.alias = {
        ...config.resolve.alias,
        // Add client modules that cause issues
        'react-dom/server': path.resolve(__dirname, './scripts/empty-module.js')
      };
    }

    return config;
  },

  experimental: {
    appDir: true,
    esmExternals: 'loose',
    // Disable server components features that cause issues
    serverComponents: false
    // Other experimental options...
  },
  staticPageGenerationTimeout: 1000
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key]
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig;
