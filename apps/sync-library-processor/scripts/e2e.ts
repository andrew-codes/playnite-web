import { ChildProcess } from 'child_process'
import logger from 'dev-logger'
import fs from 'fs'
import sh from 'shelljs'
import waitOn from 'wait-on'

let runCp: ChildProcess | null = null

process.on('exit', () => {
  logger.info('Exiting')
  try {
    runCp?.kill('SIGTERM')
  } catch {
    logger.error('Failed to kill server process')
  }
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  try {
    runCp?.kill('SIGTERM')
  } catch {
    logger.error('Failed to kill server process')
  }
  process.exit()
})

process.on('SIGINT', () => {
  logger.info('SIGINT')
  try {
    runCp?.kill('SIGTERM')
  } catch {
    logger.error('Failed to kill server process')
  }
  process.exit()
})

async function run() {
  // Run database migrations before tests (equivalent to globalSetup)
  logger.info('Running database migrations before e2e tests...')
  const migrateResult = sh.exec('yarn tsx ../../libs/db-client/src/migrate.ts', {
    silent: false,
  })
  if (migrateResult.code !== 0) {
    logger.error('Database migration failed')
    process.exit(1)
  }
  logger.info('Database migrations completed successfully.')

  sh.exec('rm _packaged/package.json')

  // Verify the server code has our coverage changes
  logger.info('Checking if server.js contains coverage setup...')
  const serverCode = fs.readFileSync('_packaged/server.js', 'utf-8')
  if (serverCode.includes('saveCoverage()')) {
    logger.info('✓ Server has coverage collection code')
  } else {
    logger.error(
      '✗ Server is missing coverage collection code - rebuild needed!',
    )
  }

  // Start the server (coverage is handled by server.ts in E2E mode)
  runCp = sh.exec(`node _packaged/server.js`, {
    env: {
      ...process.env,
      TEST: 'E2E',
    },
    async: true,
    silent: false,
  })

  logger.info('Waiting for server to start')
  await new Promise<void>((resolve, reject) => {
    waitOn(
      {
        resources: ['http://localhost:3001/health'],
        timeout: 30000,
      },
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })

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
  const testResult = sh.exec(
    `node --experimental-vm-modules $(yarn bin jest) --config jest.config.e2e.mjs ${jestArgs.join(' ')}`,
    {
      env: {
        ...process.env,
        CI: 'true',
        NODE_OPTIONS: '--experimental-vm-modules',
      },
      silent: false,
    },
  )

  const testExitCode = testResult.code

  logger.info('Tests completed. Checking coverage status before shutdown')

  // Check if coverage is being collected
  try {
    const coverageStatus = sh.exec(
      'curl -s http://localhost:3001/coverage-status',
      {
        silent: true,
      },
    )
    if (coverageStatus.code === 0) {
      logger.info(`Coverage status: ${coverageStatus.stdout}`)
    } else {
      logger.warn('Could not check coverage status')
    }
  } catch (err) {
    logger.warn('Error checking coverage status:', err)
  }

  logger.info('Stopping server to flush coverage data')

  // Kill the server and wait for it to write coverage
  runCp?.kill('SIGTERM')

  // Wait for server to exit and write coverage
  await new Promise((resolve) => setTimeout(resolve, 3000))

  logger.info('Generating coverage reports')

  // Ensure .nyc_output directory exists and has coverage data
  const nycOutputDir = '.nyc_output'
  if (!fs.existsSync(nycOutputDir)) {
    logger.error('No .nyc_output directory found')
  } else {
    const files = fs.readdirSync(nycOutputDir)
    logger.info(`Coverage files in .nyc_output: ${files.join(', ')}`)

    // Log contents of each coverage file for debugging
    files.forEach((file) => {
      if (file.endsWith('.json')) {
        const filePath = `${nycOutputDir}/${file}`
        const content = fs.readFileSync(filePath, 'utf-8')
        logger.info(`${file} size: ${content.length} bytes`)
        if (content.length < 100) {
          logger.warn(`${file} appears to be empty or very small: ${content}`)
        } else {
          // Log first few keys to verify it has real coverage
          try {
            const parsed = JSON.parse(content)
            const keys = Object.keys(parsed)
            logger.info(`${file} contains coverage for ${keys.length} files`)
            if (keys.length > 0) {
              logger.info(`  First file: ${keys[0]}`)
            }
          } catch (err) {
            logger.error(`${file} contains invalid JSON`)
          }
        }
      }
    })
  }

  sh.rm('-rf', '.test-runs/e2e')
  const reportResult = sh.exec(
    'yarn nyc report --reporter=text --reporter=lcov --reporter=json',
  )

  if (reportResult.code !== 0) {
    logger.error('Failed to generate coverage reports')
  }

  // Verify coverage file was created
  const coverageFile = '.test-runs/e2e/coverage-final.json'
  if (fs.existsSync(coverageFile)) {
    const coverageContent = fs.readFileSync(coverageFile, 'utf-8')
    logger.info(`Coverage file size: ${coverageContent.length} bytes`)
    if (coverageContent === '{}') {
      logger.error('Coverage file is empty!')
    } else {
      logger.info('Coverage file generated successfully')
    }
  } else {
    logger.error('Coverage file was not created')
  }

  process.exit(testExitCode)
}

run().catch((error) => {
  logger.error('Error running e2e tests:', error)
  process.exit(1)
})
