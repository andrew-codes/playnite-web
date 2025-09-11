import { ChildProcess } from 'child_process'
import logger from 'dev-logger'
import sh from 'shelljs'
import waitOn from 'wait-on'

let testCp: ChildProcess | null = null
let runCp: ChildProcess | null = null
process.on('exit', () => {
  logger.info('Exiting')
  ;[runCp, testCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {}
  })
})
process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  ;[runCp, testCp].forEach((cp) => {
    try {
      cp?.kill('SIGTERM')
    } catch {}
  })
  process.exit()
})
process.on('SIGINT', () => {
  logger.info('SIGINT')
  ;[runCp, testCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {}
  })
  process.exit()
})

logger.info('Removing package.json')
sh.exec('rm _packaged/package.json')
sh.exec('cp e2e.env _packaged/local.env')

logger.info('Starting server')
runCp = sh.exec(`yarn tsx scripts/startDevServer.ts`, {
  env: {
    ...process.env,
    TEST: 'e2e',
    NODE_ENV: 'development',
  },
  async: true,
  silent: false,
})

logger.info('Waiting for server to start')
waitOn({ resources: ['http://localhost:3000'], timeout: 30000 }, (err) => {
  if (err) {
    logger.error(err)
    process.exit(1)
  }

  logger.info('Running Cypress tests')
  testCp = sh.exec(`yarn cypress open --e2e --browser chrome`, {
    env: {
      ...process.env,
      TEST: 'e2e',
      CI: 'true',
      NODE_ENV: 'production',
    },
    async: true,
  })
  testCp.on('close', (code) => {
    logger.info('Cypress tests closing.')
    process.exit(code)
  })
})
