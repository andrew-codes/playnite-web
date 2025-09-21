import logger from 'dev-logger'
import { existsSync, globSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'

async function run() {
  if (!existsSync('build')) {
    logger.error('Build files not found. Please build the project first.')
    process.exit(1)
  }

  logger.info('Copying built files to _packaged')
  await fs.mkdir(path.join('_packaged'), { recursive: true })
  await fs.cp('build', '_packaged', { recursive: true })

  logger.info('Copying prisma query engine runtimes.')
  await Promise.all(
    globSync('../../libs/db-client/.generated/prisma/*.node').map(
      async (file: string) => {
        await fs.cp(file, path.join('_packaged/', path.basename(file)))
      },
    ),
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
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
