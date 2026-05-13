const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tcgdex.net',
      },
    ],
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname),
      '@components': path.join(__dirname, 'app/components'),
      '@lib': path.join(__dirname, 'lib'),
    };
    return config;
  },
};

module.exports = nextConfig;
