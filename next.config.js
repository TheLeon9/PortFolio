/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: reactStrictMode is disabled because Three.js doesn't handle
  // React's double-invocation of effects in development mode well.
  // The cleanup/reinit cycle breaks the WebGL context.
  reactStrictMode: false,

  productionBrowserSourceMaps: false,

  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.glsl/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
