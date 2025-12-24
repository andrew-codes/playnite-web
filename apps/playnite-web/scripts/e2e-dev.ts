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
    } catch {
      logger.error('Failed to kill process')
    }
  })
})
process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  ;[runCp, testCp].forEach((cp) => {
    try {
      cp?.kill('SIGTERM')
    } catch {
      logger.error('Failed to kill process')
    }
  })
  process.exit()
})
process.on('SIGINT', () => {
  logger.info('SIGINT')
  ;[runCp, testCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {
      logger.error('Failed to kill process')
    }
  })
  process.exit()
})

logger.info('Removing package.json')
sh.exec('rm _packaged/package.json')

logger.info('Processor server running. Starting server')
runCp = sh.exec(`yarn nx start playnite-web-app`, {
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
  logger.info('Running Cypress tests')
  testCp = sh.exec(`yarn nx test/open playnite-web-app`, {
    env: {
      ...process.env,
      TEST: 'e2e',
      NODE_ENV: 'development',
    },
    async: true,
  })
  testCp.on('close', (code) => {
    logger.info('Cypress tests closing.')
    process.exit(code)
  })
})
