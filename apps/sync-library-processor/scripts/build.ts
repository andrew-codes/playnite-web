import logger from 'dev-logger'
import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'
import path from 'path'
import pkg from '../package.json'

async function run() {
  const plugins: Array<Plugin> = []
  if (process.env.INSTRUMENT === 'true') {
    const preloader: IstanbulPluginPreloader = async (args) => {
      let contents = await fs.readFile(args.path, 'utf-8')
      contents = (
        await transform(contents, {
          format: 'cjs',
          platform: 'node',
          loader: 'ts',
          define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          },
        })
      ).code

      return {
        contents,
      }
    }
    plugins.push(
      esbuildPluginIstanbul({
        filter: /src\/.*\.ts/,
        loader: 'ts',
        // preloader,
        name: 'istanbul-loader-src-ts',
      }),
    )
  }
  logger.info(
    Object.entries(pkg.dependencies)
      .filter(([key, version]) => {
        return !version.includes('workspace:') && key !== 'db-client'
      })
      .map(([key]) => key),
  )
  logger.debug(`Building...`)
  await Promise.all([
    build({
      format: 'cjs',
      entryPoints: {
        server: path.join('src/server.ts'),
      },
      // tsconfig: 'tsconfig.server.json',
      external: Object.entries(pkg.dependencies)
        .filter(([key, version]) => {
          return !version.includes('workspace:')
        })
        .map(([key]) => key),
      bundle: true,
      minify: false,
      outdir: 'build',
      platform: 'node',
      sourcemap: 'inline',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
      // plugins,
    }),
  ])

  logger.debug(`Build complete`)
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
