import logger from 'dev-logger'
import { build } from 'esbuild'
import fs from 'fs/promises'
import { globSync } from 'glob'
import path from 'path'

async function run() {
  logger.debug(`Building...`)
  await Promise.all([
    build({
      format: 'esm',
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

  logger.info('Modifying imports of generated files')
  await Promise.all(
    globSync('build/**/*.js').map(async (file: string) => {
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

  logger.debug(`Build complete`)
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
