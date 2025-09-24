/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maroon-nearby-bedbug-535.mypinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
  webpack: (config) => {
    // Ensure noble libs resolve to ESM builds to avoid named export issues
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // Use absolute file paths to top-level noble ESM files to avoid nested older copies
    config.resolve.alias['@noble/hashes/utils'] = path.resolve(process.cwd(), 'node_modules/@noble/hashes/esm/utils.js');
    config.resolve.alias['@noble/hashes/hmac'] = path.resolve(process.cwd(), 'node_modules/@noble/hashes/esm/hmac.js');
    return config;
  },
};

export default nextConfig;
