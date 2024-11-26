import { build } from 'esbuild'
import istanbul from 'esbuild-plugin-istanbul'

const plugins = []
if (process.env.INSTRUMENT) {
  plugins.push(
    istanbul.esbuildPluginIstanbul({
      filter: /src\/.*ts$/,
      loader: 'ts',
      name: 'istanbul-loader-ts',
    }),
  )
  plugins.push(
    istanbul.esbuildPluginIstanbul({
      filter: /src\/.*tsx$/,
      loader: 'tsx',
      name: 'istanbul-loader-tsx',
    }),
  )
  plugins.push(
    istanbul.esbuildPluginIstanbul({
      filter: /server.ts$/,
      loader: 'ts',
      name: 'istanbul-loader-ts',
    }),
  )
  plugins.push(
    istanbul.esbuildPluginIstanbul({
      filter: /app.ts$/,
      loader: 'ts',
      name: 'istanbul-loader-ts',
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
  sourcemap: process.env.NODE_ENV !== 'production',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  plugins,
})
