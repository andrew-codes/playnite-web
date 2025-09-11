import logger from 'dev-logger'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import { globSync } from 'glob'
import path from 'path'

async function run() {
  if (!existsSync('build') || !existsSync('_build-output')) {
    logger.error('Build files not found. Please build the project first.')
    process.exit(1)
  }

  logger.info('Copying built files to _packaged.')
  await fs.mkdir(path.join('_packaged', 'src', 'server'), { recursive: true })
  await fs.mkdir(path.join('_packaged', 'src', 'client'), { recursive: true })
  await fs.cp('_build-output', '_packaged', { recursive: true })
  await fs.cp('build/client', '_packaged/src/client', { recursive: true })

  logger.info('Copying db client related files.')
  await Promise.all(
    globSync('../../libs/db-client/.generated/prisma/*.node').map(
      async (file: string) => {
        await fs.cp(
          file,
          path.join('_packaged/src/server', path.basename(file)),
        )
      },
    ),
  )
  await fs.cp(
    path.join('../../libs/db-client/src/schema.prisma'),
    path.join('_packaged/src/server/schema.prisma'),
  )
  await fs.cp(
    path.join('../../libs/db-client/src/migrations'),
    path.join('_packaged/src/server/migrations'),
    { recursive: true },
  )

  logger.info('Copying and modifying package.json')
  const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'))
  pkg.name = `packaged-${pkg.name}`
  pkg.devDependencies = {}
  pkg.dependencies = Object.fromEntries(
    Object.entries<string>(pkg.dependencies).filter(
      ([key, value]) => !value.startsWith('workspace:'),
    ),
  )
  await fs.writeFile(
    '_packaged/package.json',
    JSON.stringify(pkg, null, 2),
    'utf8',
  )

  await fs.mkdir(path.join('_packaged', 'src', 'public', 'assets'), {
    recursive: true,
  })
  logger.info('Copying assets')
  await fs.cp('src/public/assets', '_packaged/src/public/assets', {
    recursive: true,
  })
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
