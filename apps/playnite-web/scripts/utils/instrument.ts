import { build, type Plugin } from 'esbuild'
import { esbuildPluginIstanbul } from 'esbuild-plugin-istanbul'
import { cp } from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

async function run() {
  const plugins: Array<Plugin> = []

  plugins.push(
    esbuildPluginIstanbul({
      filter: /_packaged\/.*\.js/,
      loader: 'js',
      name: 'istanbul-loader',
    }),
  )

  await build({
    format: 'esm',
    entryPoints: glob.sync('_packaged/src/**/*.js'),
    bundle: false,
    minify: false,
    outdir: '_instrumented/src',
    platform: 'node',
    sourcemap: true,
    plugins,
  })

  await build({
    format: 'esm',
    entryPoints: glob.sync('_packaged/.generated/**/*.js'),
    bundle: false,
    minify: false,
    outdir: '_instrumented/.generated',
    platform: 'node',
    sourcemap: true,
    plugins,
  })

  await cp(
    path.join('_packaged/src/public'),
    path.join('_instrumented/src/public'),
    { recursive: true },
  )
}

run()
