import { build, transform, type Plugin } from 'esbuild'
import {
  esbuildPluginIstanbul,
  IstanbulPluginPreloader,
} from 'esbuild-plugin-istanbul'
import fs from 'fs/promises'
import sh from 'shelljs'

async function run() {
  const generateDb = new Promise((resolve, reject) => {
    const prismaCp = sh.exec(
      `yarn pnpify prisma generate --schema=src/server/data/providers/postgres/schema.prisma`,
      { async: true },
    )
    prismaCp.on('exit', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error('Prisma generate failed'))
      }
    })
  })

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

  const buildGraphql = new Promise((resolve, reject) => {
    const graphqlBuild = sh.exec(`yarn graphql-codegen --config codegen.ts`, {
      async: true,
      env: {
        ...process.env,
      },
    })
    graphqlBuild.on('exit', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error('GraphQL build failed'))
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

  await Promise.all([generateDb, buildRemix, buildGraphql])

  await Promise.all([
    build({
      format: 'esm',
      entryPoints: {
        server: 'src/server/server.ts',
      },
      tsconfig: 'tsconfig.server.json',
      packages: 'external',
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
}

run()
