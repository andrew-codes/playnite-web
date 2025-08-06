import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  type IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'
import { glob } from 'glob'
import sh from 'shelljs'

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
  )
}

const entryPoints = glob.sync('src/server/**/*.ts', {
  ignore: ['**/*__tests__/**', '**/__component_tests__/**'],
})

build({
  format: 'esm',
  entryPoints: entryPoints,
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
