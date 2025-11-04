import logger from 'dev-logger'
import { existsSync, globSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'

async function run() {
  if (!existsSync('_custom-server-build') || !existsSync('.next')) {
    logger.error('Build files not found. Please build the project first.')
    process.exit(1)
  }

  logger.info('Copying built files to _packaged.')
  await fs.mkdir(path.join('_packaged/.next'), { recursive: true })
  await fs.cp('_custom-server-build', '_packaged', { recursive: true })
  await fs.cp('.next', '_packaged/.next', { recursive: true })

  await fs.cp(
    path.join('../../libs/db-client/src/prisma.config.ts'),
    path.join('_packaged/prisma.config.ts'),
  )
  await fs.cp(
    path.join('../../libs/db-client/src/schema.prisma'),
    path.join('_packaged/schema.prisma'),
  )
  await fs.cp(
    path.join('../../libs/db-client/src/migrations'),
    path.join('_packaged/migrations'),
    { recursive: true },
  )
  await fs.cp(
    path.join('../../libs/db-client/.generated'),
    path.join('_packaged/.generated'),
    { recursive: true },
  )

  await fs.cp(
    path.join('next.config.js'),
    path.join('_packaged/next.config.js'),
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

  logger.info('Copying generated Prisma client')
  await fs.mkdir(path.join('_packaged/node_modules/db-client'), {
    recursive: true,
  })
  await fs.cp(
    path.join('../../libs/db-client/.generated'),
    path.join('_packaged/node_modules/db-client/.generated'),
    { recursive: true },
  )
  await fs.cp(
    path.join('../../libs/db-client/src'),
    path.join('_packaged/node_modules/db-client/src'),
    { recursive: true },
  )
  await fs.cp(
    path.join('../../libs/db-client/package.json'),
    path.join('_packaged/node_modules/db-client/package.json'),
  )

  logger.info('Copying binaries for Prisma')
  await fs.mkdir(path.join('_packaged/.prisma/client'), {
    recursive: true,
  })
  await Promise.all(
    globSync(path.join('../../node_modules/.prisma/client/*.node')).map(
      (file) => {
        logger.debug(`Copying binary: ${path.basename(file)}`)
        return fs.cp(
          file,
          path.join('_packaged/.prisma/client', path.basename(file)),
        )
      },
    ),
  )

  logger.info('Copying assets')
  await fs.mkdir(path.join('_packaged/.next/static/media/assets'), {
    recursive: true,
  })
  await fs.cp('public/assets', '_packaged/.next/static/media/assets', {
    recursive: true,
  })
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
