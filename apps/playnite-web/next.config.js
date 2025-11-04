//@ts-check

const { composePlugins, withNx } = require('@nx/next')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},

  compiler: {
    // For other options, see https://nextjs.org/docs/architecture/nextjs-compiler#emotion
    emotion: true,
  },

  typescript: {
    tsconfigPath: 'tsconfig.app.json',
  },

  reactStrictMode: process.env.TEST !== 'e2e',
  experimental: {
    authInterrupts: true,
    // Only force SWC transforms when not instrumenting (for better performance)
    forceSwcTransforms: process.env.INSTRUMENT !== 'true',
    ppr: false,
  },
  transpilePackages: ['db-client', '@prisma/client'],

  // Configure webpack for code coverage instrumentation
  webpack: (config, { isServer }) => {
    if (process.env.INSTRUMENT === 'true') {
      // Instrument client-side code (React components, client code)
      if (!isServer) {
        config.module.rules.push({
          test: /\.(tsx?|jsx?)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['next/babel'],
              plugins: ['babel-plugin-istanbul'],
            },
          },
        })
      }
    }
    return config
  },

  images: {
    imageSizes: [175, 230, 280, 320],
    formats: ['image/webp'],
  },

  // output: 'standalone',
}

const plugins = [withNx]

const config = composePlugins(...plugins)(nextConfig)

module.exports = config
