import { ChildProcess } from 'child_process'
import logger from 'dev-logger'
import fs from 'fs'
import path from 'path'
import sh from 'shelljs'
import waitOn from 'wait-on'

let testCp: ChildProcess | null = null
let runCp: ChildProcess | null = null
let appCp: ChildProcess | null = null
process.on('exit', () => {
  logger.info('Exiting')
  ;[runCp, testCp, appCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {}
  })
})
process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  ;[runCp, testCp, appCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {}
  })
  process.exit()
})
process.on('SIGINT', () => {
  logger.info('SIGINT')
  ;[runCp, testCp, appCp].forEach((cp) => {
    try {
      cp?.kill('SIGINT')
    } catch {}
  })
  process.exit()
})

try {
  fs.unlinkSync(path.join('../playnite-web/_packaged/package.json'))
} catch (error) {}
appCp = sh.exec(`yarn node server.js`, {
  async: true,
  cwd: path.join('../playnite-web/_packaged/src/server'),
  env: {
    ...process.env,
    INSTRUMENT: 'false',
    NODE_ENV: 'production',
    PORT: '3000',
    SECRET: 'test-secret',
  },
  silent: false,
})

waitOn(
  {
    resources: ['http://localhost:3000'],
    timeout: 60000,
  },
  async (err) => {
    if (err) {
      logger.error(err)
      process.exit(1)
    }

    fs.mkdirSync('.game-assets', { recursive: true })

    sh.exec('rm _packaged/package.json')
    runCp = sh.exec(`yarn nyc node server.js`, {
      cwd: '_packaged',
      env: {
        ...process.env,
        TEST: 'e2e',
        NODE_ENV: 'production',
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
      (err) => {
        if (err) {
          logger.error(err)
          process.exit(1)
        }

        const [, , ...args] = process.argv
        let jestArgs: Array<string> = []
        if (args.find((a) => a === '--watch' || a === '-w')) {
          jestArgs.push('--watch')
        }
        let specFilter = args.filter((a) => a !== '--watch' && a !== '-w')
        if (specFilter.length > 0) {
          jestArgs.push('--testNamePattern')
          jestArgs.push(`(${specFilter.join('|')})`)
        }
        logger.info('Running integration tests')
        testCp = sh.exec(
          `yarn jest --config jest.config.e2e.js ${jestArgs.join(' ')}`,
          {
            env: {
              ...process.env,
              CI: 'true',
              NODE_ENV: 'production',
            },
            async: true,
          },
        )
        testCp.on('close', (code) => {
          logger.info('Tests closing.')
          process.exit(code)
        })
      },
    )
  },
)
