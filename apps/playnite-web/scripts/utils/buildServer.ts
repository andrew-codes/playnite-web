import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  type IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'

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

build({
  format: 'esm',
  entryPoints: ['src/server/**/*.ts'],
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
