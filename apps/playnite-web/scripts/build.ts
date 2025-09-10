import logger from 'dev-logger'
import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'
import { globSync } from 'glob'
import sh from 'shelljs'
import pkg from '../package.json' with { type: 'json' }

async function run() {
  const buildRemix = new Promise((resolve, reject) => {
    const remixBuild = sh.exec(`yarn remix vite:build`, {
      async: true,
      env: {
        ...process.env,
      },
    })
    remixBuild.on('exit', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error('Remix build failed'))
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
        filter: /.generated\/.*\.ts/,
        loader: 'ts',
        preloader,
        name: 'istanbul-loader-generated-ts',
      }),
    )
    plugins.push(
      esbuildPluginIstanbul({
        filter: /build\/.*\.js/,
        loader: 'js',
        name: 'istanbul-loader-build-js',
      }),
    )
  }

  const codes = await Promise.all([buildRemix])
  console.debug(
    `Prisma generate, Remix build, and GraphQL codegen completed with codes: ${codes}`,
  )

  console.debug(`Build server-side plus Remix combo`)
  await Promise.all([
    build({
      format: 'esm',
      entryPoints: {
        server: 'src/server/server.ts',
      },
      tsconfig: 'tsconfig.server.json',
      external: Object.entries(pkg.dependencies)
        .filter(([name, version]) => !version.startsWith('workspace:'))
        .map(([name, version]) => name),
      bundle: true,
      minify: false,
      outdir: '_build-output/src/server',
      platform: 'node',
      sourcemap:
        process.env.NODE_ENV !== 'production' ||
        process.env.INSTRUMENT === 'true',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
      plugins,
    }),
    build({
      format: 'esm',
      entryPoints: ['.generated/*.ts'],
      tsconfig: 'tsconfig.server.json',
      bundle: false,
      minify: false,
      outdir: '_build-output/.generated',
      platform: 'node',
      sourcemap:
        process.env.NODE_ENV !== 'production' ||
        process.env.INSTRUMENT === 'true',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
      plugins,
    }),
    build({
      format: 'esm',
      entryPoints: {
        index: 'build/server/index.js',
      },
      bundle: false,
      minify: false,
      outdir: '_build-output/src/server',
      platform: 'node',
      sourcemap: false,
      plugins,
    }),
  ])

  logger.info('Modifying imports of generated files')
  await Promise.all(
    globSync('_build-output/.generated/*.js').map(async (file: string) => {
      let contents: string = await fs.readFile(file, 'utf8')

      const writeContents = contents
        .split('\n')
        .map((line) => {
          const matched =
            /import\s+(.*)\s+from\s+['"](\.\.?\/)(.+)['"];/gm.exec(line)
          if (matched?.[3].endsWith('.js')) {
            return line
          }
          return matched
            ? `import ${matched[1]} from '${matched[2]}${matched[3]}.js';`
            : line
        })
        .join('\n')
      await fs.writeFile(file, writeContents, 'utf8')
    }),
  )

  console.debug(`Build complete`)
}

run().catch((error) => {
  console.error('FAILURE', error)
  process.exit(1)
})
