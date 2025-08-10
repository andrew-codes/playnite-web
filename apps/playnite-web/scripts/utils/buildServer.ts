import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'
import sh from 'shelljs'

async function run() {
  sh.exec(
    `yarn pnpify prisma generate --schema=src/server/data/providers/postgres/schema.prisma`,
  )

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
        name: 'istanbul-loader-ts',
      }),
    )
    plugins.push(
      esbuildPluginIstanbul({
        filter: /.generated\/.*\.ts/,
        loader: 'ts',
        preloader,
        name: 'istanbul-loader-ts',
      }),
    )
  }

  await build({
    format: 'esm',
    entryPoints: {
      'server.js': 'src/server/server.ts',
    },
    tsconfig: 'tsconfig.server.json',
    packages: 'external',
    bundle: true,
    minify: false,
    outdir: '_build-output',
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
    outdir: '_build-output/.generated',
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
