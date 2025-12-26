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
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  transpilePackages: localPackages,

  // Configure webpack for code coverage instrumentation
  webpack: (config, { isServer }) => {
    if (process.env.INSTRUMENT === 'true') {
      // Instrument client-side code (React components, client code)
      if (!isServer) {
        config.module.rules.push({
          test: /\\.(tsx?|jsx?)$/,
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

    // Mark Prisma packages as external to prevent bundling
    if (isServer) {
      config.externals = config.externals || []
      // Handle both array and function externals
      const prismaExternals = [
        '@prisma/client',
        '@prisma/adapter-pg',
        'pg',
        /^@prisma\/client\/.*/,
      ]

      if (Array.isArray(config.externals)) {
        config.externals.push(...prismaExternals)
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals
        config.externals = async (context, request, callback) => {
          if (
            prismaExternals.some((ext) =>
              ext instanceof RegExp ? ext.test(request) : ext === request,
            )
          ) {
            return callback(null, `commonjs ${request}`)
          }
          return originalExternals(context, request, callback)
        }
      }
    }

    return config
  },

  images: {
    imageSizes: [175, 230, 280, 320],
    qualities: [50, 75, 100],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        port: '*',
        pathname: 'cover-art/**',
      },
      {
        protocol: 'https',
        hostname: '*',
        port: '*',
        pathname: 'assets/**',
      },
    ],
  },

  // output: 'standalone',
}

const plugins = [withNx]

const config = composePlugins(...plugins)(nextConfig)

export default config
