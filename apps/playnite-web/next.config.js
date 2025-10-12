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
    forceSwcTransforms: true,
    ppr: false,
  },
  transpilePackages: ['db-client', '@prisma/client'],

  // output: 'standalone',
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
]

const config = composePlugins(...plugins)(nextConfig)

module.exports = config
