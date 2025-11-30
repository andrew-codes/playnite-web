import { ChildProcess } from 'child_process'
import logger from 'dev-logger'
import sh from 'shelljs'
import waitOn from 'wait-on'

let runCp: ChildProcess | null = null
process.on('exit', () => {
  logger.info('Exiting')
  ;[runCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {
      logger.error('Failed to kill child process')
    }
  })
})
process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  ;[runCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {
      logger.error('Failed to kill child process')
    }
  })
  process.exit()
})
process.on('SIGINT', () => {
  logger.info('SIGINT')
  ;[runCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {
      logger.error('Failed to kill child process')
    }
  })
  process.exit()
})

async function run() {
  sh.exec('rm _packaged/package.json')
  runCp = sh.exec(`yarn nyc node server.js`, {
    cwd: '_packaged',
    env: {
      ...process.env,
      PORT: '3001',
    },
    async: true,
    silent: false,
  })

  await new Promise((resolve) => {
    logger.info('Waiting for server to start')
    waitOn(
      {
        resources: ['http://localhost:3001/health'],
        timeout: 30000,
      },
      () => {
        logger.info('Server is up')
        resolve(true)
      },
    )
  })
}

run()
