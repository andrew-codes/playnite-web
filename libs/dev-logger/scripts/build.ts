import { build, type Plugin } from 'esbuild'
import fs from 'fs'
import path from 'path'

async function run() {
  const plugins: Array<Plugin> = []

  await build({
    format: 'cjs',
    entryPoints: {
      index: path.join('src/index.ts'),
    },
    tsconfig: 'tsconfig.json',
    bundle: false,
    minify: false,
    outdir: 'build',
    platform: 'node',
    sourcemap: process.env.NODE_ENV !== 'production',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? ''),
    },
    plugins,
  })
  fs.cpSync(path.join('build/index.js'), path.join('build/index.cjs'), {
    force: true,
  })

  await build({
    format: 'esm',
    entryPoints: {
      index: path.join('src/index.ts'),
    },
    tsconfig: 'tsconfig.json',
    bundle: false,
    minify: false,
    outdir: 'build',
    platform: 'node',
    sourcemap: process.env.NODE_ENV !== 'production',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? ''),
    },
    plugins,
  })
}
run().catch((error) => {
  process.exit(1)
})
