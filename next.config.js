/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  productionBrowserSourceMaps: true,

  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.glsl/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
