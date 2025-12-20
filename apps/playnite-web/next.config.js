//@ts-check

import { composePlugins, withNx } from '@nx/next'
import pkg from './package.json' with { type: 'json' }

const localPackages = Object.entries(pkg.dependencies || {})
  .filter(([dep, v]) => v.startsWith('workspace:'))
  .map(([dep]) => dep)

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
  transpilePackages: ['@prisma/client'].concat(localPackages),

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

  // output: 'standalone',
}

const plugins = [withNx]

const config = composePlugins(...plugins)(nextConfig)

export default config
