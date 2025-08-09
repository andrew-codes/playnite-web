import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  type IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'
import { glob } from 'glob'
import sh from 'shelljs'

async function run() {
  sh.exec(
    `yarn pnpify prisma generate --schema=src/server/data/providers/postgres/schema.prisma`,
  )
  sh.exec(`yarn graphql-codegen --config codegen.ts`)

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
        filter: /src\/server\/.*\.ts/,
        loader: 'ts',
        preloader,
        name: 'istanbul-loader-ts',
      }),
      esbuildPluginIstanbul({
        filter: /src\/auth\/.*\.ts/,
        loader: 'ts',
        preloader,
        name: 'istanbul-loader-ts',
      }),
    )
  }

  await build({
    format: 'esm',
    entryPoints: glob.sync('src/server/**/*.ts', {
      ignore: ['**/*__tests__/**', '**/__component_tests__/**'],
    }),
    tsconfig: 'tsconfig.server.json',
    bundle: false,
    minify: false,
    outdir: '.build-server/src/server',
    platform: 'node',
    sourcemap:
      process.env.NODE_ENV !== 'production' ||
      process.env.INSTRUMENT === 'true',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins,
  })

  await build({
    format: 'esm',
    entryPoints: ['.generated/*.ts'],
    tsconfig: 'tsconfig.server.json',
    bundle: false,
    minify: false,
    outdir: '.build-server/.generated',
    platform: 'node',
    sourcemap:
      process.env.NODE_ENV !== 'production' ||
      process.env.INSTRUMENT === 'true',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins,
  })

  await build({
    format: 'esm',
    entryPoints: glob.sync('src/auth/**/*.ts', {
      ignore: ['**/*__tests__/**', '**/__component_tests__/**'],
    }),
    tsconfig: 'tsconfig.server.json',
    bundle: false,
    minify: false,
    outdir: '.build-server/src/auth',
    platform: 'node',
    sourcemap:
      process.env.NODE_ENV !== 'production' ||
      process.env.INSTRUMENT === 'true',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins,
  })
}

run()
