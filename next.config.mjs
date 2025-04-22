import path from 'path';

/**
 * Use import.meta.url to emulate __dirname in ESM
 */
const __dirname = path.dirname(new URL('.', import.meta.url).pathname);

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

  // Change this to enable dynamic routes
  // output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  webpack: (config, { isServer, dev }) => {
    if (!dev && isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom/server': path.resolve(__dirname, './scripts/empty-module.js')
      };
    }
    return config;
  },

  // experimental: {
  //   appDir: true,
  //   esmExternals: 'loose',
  //   serverComponents: false
  // },

  staticPageGenerationTimeout: 1000
};

mergeConfig(nextConfig, userConfig?.default);

/**
 * Merge user config into base config
 */
function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) return;

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key]) &&
      nextConfig[key] !== null
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
