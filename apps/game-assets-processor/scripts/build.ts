import logger from 'dev-logger'
import { build } from 'esbuild'
import { globSync } from 'glob'
import path from 'path'

async function run() {
  logger.debug(`Building...`)
  await Promise.all([
    build({
      format: 'cjs',
      entryPoints:
        process.env.INSTRUMENT === 'true'
          ? globSync('src/**/*.ts')
          : {
              server: path.join('src/server.ts'),
            },
      tsconfig: 'tsconfig.server.json',
      bundle: false,
      minify: false,
      outdir: 'build',
      platform: 'node',
      sourcemap: 'inline',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ])

  logger.debug(`Build complete`)
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
