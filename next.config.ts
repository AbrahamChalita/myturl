interface ExperimentalConfig {
  runtime: string;
}

interface WebpackConfig {
  resolve: {
    fallback: {
      [key: string]: boolean;
    };
  };
}

interface NextConfig {
  output: string;
  experimental: ExperimentalConfig;
  webpack: (config: WebpackConfig, options: { isServer: boolean; dev: boolean }) => WebpackConfig;
}

const nextConfig: NextConfig = {
  output: "standalone", // Ensures Edge-compatible output
  experimental: {
    runtime: "edge",
  },
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        "fs/promises": false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
      };
    }
    return config;
  },
};