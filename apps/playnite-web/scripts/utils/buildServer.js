import { build } from 'esbuild'
import { esbuildPluginIstanbul } from 'esbuild-plugin-istanbul'

const plugins = []
if (process.env.INSTRUMENT) {
  plugins.push(
    esbuildPluginIstanbul({
      filter: /src\/server\/.*ts/,
      loader: 'ts',
      name: 'istanbul-loader-ts',
    }),
  )
  plugins.push(
    esbuildPluginIstanbul({
      filter: /server\.ts/,
      loader: 'ts',
      name: 'istanbul-loader-server-ts',
    }),
  )
  plugins.push(
    esbuildPluginIstanbul({
      filter: /app\.ts/,
      loader: 'ts',
      name: 'istanbul-loader-app-ts',
    }),
  )
}

build({
  entryPoints: ['server.ts'],
  bundle: true,
  minify: true,
  external: ['lightningcss', 'esbuild', 'sharp', 'mongodb'],
  outfile: `server.${process.env.NODE_ENV ?? 'development'}.cjs`,
  platform: 'node',
  sourcemap:
    process.env.NODE_ENV !== 'production' || process.env.INSTRUMENT === 'true',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  plugins,
})
