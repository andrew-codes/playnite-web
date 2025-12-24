import { ChildProcess } from 'child_process'
import logger from 'dev-logger'
import fs from 'fs/promises'
import sh from 'shelljs'
import { getDockerTags } from 'versioning'
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

async function run() {
  if (process.env.CI !== 'true' || process.env.COVERAGE === 'true') {
    logger.info('Removing package.json')
    sh.exec('mv _packaged/package.json _packaged/deps.json')

    const nextConfigContents = await fs.readFile(
      '_packaged/next.config.js',
      'utf-8',
    )
    logger.info('Modifying next.config.js for E2E tests')
    await fs.writeFile(
      '_packaged/next.config.js',
      nextConfigContents.replace(
        "import pkg from './package.json' with { type: 'json' }",
        "import pkg from './deps.json'",
      ),
    )

    logger.info('Starting server')
    runCp = sh.exec(`yarn nyc node server.js`, {
      cwd: '_packaged',
      shell: '/bin/bash',
      env: {
        ...process.env,
        TEST: 'e2e',
        NODE_ENV: 'production',
        SECRET: 'secret',
        DATABASE_URL:
          'postgresql://local:dev@localhost:5432/games?schema=public',
      },
      async: true,
    })
    runCp.stdout?.on('data', (data) => {
      logger.info(data.toString())
    })
    runCp.stderr?.on('data', (data) => {
      logger.error(data.toString())
    })
    runCp.on('close', (code) => {
      logger.info('Server closing.')
      if (code !== 0) {
        logger.error(`Server exited with code ${code}`)
        process.exit(code)
      }
    })
  } else {
    logger.info(
      'Running from docker image. Please ensure you have built a local docker image.',
    )
    logger.info(
      'In bash, run `LOCAL=true PLATFORM=linux/amd64,linux/arm64 yarn nx run playnite-web-app:package:e2e`',
    )
    let tag = 'local'
    if (process.env.LOCAL !== 'true') {
      const { GITHUB_REF, VERSION } = process.env
      const tags = await getDockerTags(VERSION, GITHUB_REF)
      tag = tags[0]
    }
    logger.debug(`Using docker tag: ${tag}`)
    sh.exec(`docker container rm playnite-web --force || true`)
    const runCp = sh.exec(
      `docker run --name playnite-web --network host -p 3000:3000 -e CI=true -e TEST=e2e -e NODE_ENV=production -e SECRET="Secret" -e DATABASE_URL="postgresql://local:dev@localhost:5432/games?schema=public" ghcr.io/andrew-codes/playnite-web-app:${tag}`,
      {
        env: {
          ...process.env,
        },
        async: true,
        silent: false,
      },
    )
    runCp.on('close', (code) => {
      logger.info('Server closing.')
      if (code !== 0) {
        logger.error(`Server exited with code ${code}`)
        process.exit(code)
      }
    })
  }

  logger.info('Waiting for server to start')
  waitOn({ resources: ['http://localhost:3000'], timeout: 30000 }, () => {
    const [, , specFilter] = process.argv
    logger.info('Running Cypress tests')
    testCp = sh.exec(
      `yarn cypress ${process.env.CMD ?? 'run'} --e2e --browser chrome ${specFilter && `--spec cypress/e2e/**/${specFilter}*`}`,
      {
        env: {
          ...process.env,
          TEST: 'e2e',
          CI: 'true',
          NODE_ENV: 'production',
        },
        async: true,
      },
    )
    testCp.on('close', (code) => {
      logger.info('Cypress tests closing.')
      if (process.env.UPDATE === 'true') {
        logger.info('Updating visual regression tests')
        sh.exec(
          `yarn cypress-image-diff-html-report start --reportJsonDir visual-regression-tests/e2e-report --autoOpen`,
        )
      }
      process.exit(code)
    })
  })
}

run().catch((error) => {
  logger.error('FAIL', error)
})
