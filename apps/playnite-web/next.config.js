//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
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

  experimental: {
    ppr: false,
  },

  async rewrites() {
    return [
      {
        source: '/api/careers/:path*',
        destination: 'https://appfigures.com/_u/careers/api/:path*',
      },
    ]
  },

  // output: 'standalone',
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
]

const config = composePlugins(...plugins)(nextConfig)

module.exports = config
