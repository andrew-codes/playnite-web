import logger from 'dev-logger'
import { build } from 'esbuild'
import fs from 'fs'
import path from 'path'

async function run() {
  logger.info(`Building...`)
  await Promise.all([
    build({
      format: 'cjs',
      entryPoints: {
        client: path.join('src/client.ts'),
      },
      tsconfig: 'tsconfig.json',
      bundle: true,
      minify: false,
      outdir: 'build',
      platform: 'node',
      sourcemap: process.env.NODE_ENV !== 'production',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? ''),
      },
    }),
  ])

  fs.cpSync(path.join('build/client.js'), path.join('build/client.cjs'), {
    force: true,
  })

  await build({
    format: 'esm',
    entryPoints: {
      client: path.join('src/client.ts'),
    },
    tsconfig: 'tsconfig.json',
    bundle: true,
    minify: false,
    outdir: 'build',
    platform: 'node',
    sourcemap: process.env.NODE_ENV !== 'production',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? ''),
    },
  })

  logger.info(`Build complete`)
}

run()
