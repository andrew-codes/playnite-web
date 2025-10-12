import { ChildProcess } from 'child_process'
import { migrate } from 'db-client/migrate'
import logger from 'dev-logger'
import fs from 'fs'
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
      logger.error('Failed to kill child process')
    }
  })
})
process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  ;[runCp, testCp].forEach((cp) => {
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
  ;[runCp, testCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {
      logger.error('Failed to kill child process')
    }
  })
  process.exit()
})

async function run() {
  await migrate()

  fs.mkdirSync('.game-assets', { recursive: true })

  sh.exec('rm _packaged/package.json')
  runCp = sh.exec(`yarn nyc node server.js`, {
    cwd: '_packaged',
    env: {
      ...process.env,
    },
    async: true,
    silent: false,
  })

  logger.info('Waiting for server to start')
  waitOn(
    {
      resources: ['http://localhost:3001/health'],
      timeout: 30000,
    },
    () => {
      const [, , ...args] = process.argv
      const jestArgs: Array<string> = []
      if (args.find((a) => a === '--watch' || a === '-w')) {
        jestArgs.push('--watch')
      }
      const specFilter = args.filter((a) => a !== '--watch' && a !== '-w')
      if (specFilter.length > 0) {
        jestArgs.push('--testNamePattern')
        jestArgs.push(`(${specFilter.join('|')})`)
      }
      logger.info('Running integration tests')
      testCp = sh.exec(
        `yarn jest --config jest.config.e2e.mjs ${jestArgs.join(' ')}`,
        {
          env: {
            ...process.env,
            CI: 'true',
          },
          async: true,
          silent: false,
        },
      )
      testCp.on('close', (code) => {
        logger.info('Tests closing.')
        process.exit(code)
      })
    },
  )
}

run()
