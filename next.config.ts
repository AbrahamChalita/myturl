/** @type {import('next').NextConfig} */
interface ExperimentalConfig {
  runtime: string;
}

interface WebpackConfig {
  (config: any, options: { isServer: boolean; dev: boolean }): any;
}

interface NextConfig {
  experimental: ExperimentalConfig;
  webpack: WebpackConfig;
}

const nextConfig: NextConfig = {
  experimental: {
    runtime: "edge", // Optional: explicitly set Edge runtime
  },
  webpack: (config, { isServer, dev }) => {
    // Only apply this in production builds for server-side code
    if (!dev && !isServer) {
      // Replace Node.js core modules with stubs or empty implementations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        crypto: false,
        child_process: false,
        fs: false,
        "fs/promises": false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;