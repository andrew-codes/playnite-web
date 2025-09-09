import { ChildProcess } from 'child_process'
import logger from 'dev-logger'
import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import waitOn from 'wait-on'
import pkg from '../package.json' with { type: 'json' }

let testCp: ChildProcess | null = null
let runCp: ChildProcess | null = null
let appCp: ChildProcess | null = null
process.on('exit', () => {
  logger.info('Exiting')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
  appCp?.kill('SIGINT')
})
process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
  appCp?.kill('SIGINT')
  process.exit()
})
process.on('SIGINT', () => {
  logger.info('SIGINT')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
  appCp?.kill('SIGINT')
  process.exit()
})

appCp = sh.exec(`yarn nx start playnite-web-app`, {
  async: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
  silent: false,
})

logger.info(
  'Running from docker image. Please ensure you have built a local docker image.',
)
let tag = 'local'
if (process.env.LOCAL !== 'true') {
  const { GITHUB_REF, VERSION } = process.env
  const tags = await getDockerTags(VERSION ?? null, GITHUB_REF)
  tag = tags[0]
}
logger.debug(`Using docker tag: ${tag}`)
sh.exec(`docker container rm playnite-web-assets --force || true`)
runCp = sh.exec(
  `docker run --name playnite-web-assets --network host -e PORT=3001 -e DATABASE_URL="postgresql://local:dev@localhost:5432/games?schema=public" ghcr.io/andrew-codes/${pkg.name}:${tag}`,
  {
    env: {
      ...process.env,
    },
    async: true,
  },
)
runCp.stdout?.on('data', (data) => {
  logger.info(data.toString())
})
runCp.stderr?.on('data', (data) => {
  logger.warn(data.toString())
})
runCp.on('close', (code) => {
  logger.info('Server closing.')
  if (code !== 0) {
    logger.error(`Server exited with code ${code}`)
    process.exit(code)
  }
})

logger.info('Waiting for server to start')
waitOn(
  {
    resources: ['http://localhost:3001/health', 'http://localhost:3000'],
    timeout: 30000,
  },
  (err) => {
    if (err) {
      logger.error(err)
      process.exit(1)
    }

    const [, , specFilter] = process.argv
    logger.info('Running integration tests')
    testCp = sh.exec(`yarn jest --config jest.config.integration.js`, {
      env: {
        ...process.env,
        CI: 'true',
        NODE_ENV: 'production',
      },
      async: true,
    })
    testCp.on('close', (code) => {
      logger.info('Tests closing.')
      process.exit(code)
    })
  },
)
