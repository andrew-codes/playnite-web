import { build } from 'esbuild'
import { esbuildPluginIstanbul } from 'esbuild-plugin-istanbul'

const plugins = []
if (process.env.INSTRUMENT === 'true') {
  plugins.push(
    esbuildPluginIstanbul({
      filter: /.*/,
      loader: 'ts',
      name: 'istanbul-loader-ts',
    }),
  )
}

build({
  format: 'esm',
  entryPoints: ['src/server/**/*.ts'],
  tsconfig: 'tsconfig.server.json',
  bundle: false,
  minify: false,
  outdir: '.build-server/src',
  platform: 'node',
  sourcemap:
    process.env.NODE_ENV !== 'production' || process.env.INSTRUMENT === 'true',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  plugins,
})

build({
  format: 'esm',
  entryPoints: ['.generated/*.ts'],
  tsconfig: 'tsconfig.server.json',
  bundle: false,
  minify: false,
  outdir: '.build-server/.generated',
  platform: 'node',
  sourcemap:
    process.env.NODE_ENV !== 'production' || process.env.INSTRUMENT === 'true',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  plugins,
})
