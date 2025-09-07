import logger from 'dev-logger'
import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'
import sh from 'shelljs'
import pkg from '../package.json' with { type: 'json' }

async function run() {
  const buildNext = new Promise((resolve, reject) => {
    const nextBuild = sh.exec(`yarn next build`, {
      async: true,
      env: {
        ...process.env,
      },
    })
    nextBuild.on('exit', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error('Next build failed'))
      }
    })
  })

  const plugins: Array<Plugin> = []
  if (process.env.INSTRUMENT === 'true') {
    const preloader: IstanbulPluginPreloader = async (args) => {
      let contents = await fs.readFile(args.path, 'utf-8')
      contents = (
        await transform(contents, {
          format: 'esm',
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
        preloader,
        name: 'istanbul-loader-src-ts',
      }),
    )
    plugins.push(
      esbuildPluginIstanbul({
        filter: /.*\.generated\/.*\.ts/,
        loader: 'ts',
        preloader,
        name: 'istanbul-loader-generated-ts',
      }),
    )
    plugins.push(
      esbuildPluginIstanbul({
        filter: /.*\.next\/.*\.js/,
        loader: 'js',
        name: 'istanbul-loader-build-js',
      }),
    )
  }

  const tasks = [buildNext]
  tasks.push(
    build({
      format: 'cjs',
      entryPoints: {
        server: 'src/server.ts',
      },
      tsconfig: 'tsconfig.server.json',
      external: Object.entries(pkg.dependencies)
        .filter(([name, version]) => !version.startsWith('workspace:'))
        .map(([name, version]) => name),
      bundle: true,
      minify: false,
      outdir: '_custom-server-build',
      platform: 'node',
      sourcemap:
        process.env.NODE_ENV !== 'production' ||
        process.env.INSTRUMENT === 'true',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
      plugins,
    }),
  )

  await buildNext
  logger.info('Modifying prisma client')
  let serverContents = await fs.readFile(
    '_custom-server-build/server.js',
    'utf8',
  )
  serverContents = serverContents
    .replace(/var __filename.*$/gm, '')
    .replace(/var __dirname.*;$/gm, '')
    .replace(/import_meta\.url/g, '__dirname')

  await fs.writeFile('_custom-server-build/server.js', serverContents, 'utf8')

  const codes = await Promise.all(tasks)
  logger.debug(`Build completed with codes: ${codes}`)
  logger.info(`Build complete`)
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
