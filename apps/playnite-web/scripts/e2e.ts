import { ChildProcess } from 'child_process'
import logger from 'dev-logger'
import sh from 'shelljs'
import waitOn from 'wait-on'

let testCp: ChildProcess | null = null
let runCp: ChildProcess | null = null
process.on('exit', () => {
  logger.info('Exiting')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
})
process.on('SIGTERM', () => {
  logger.info('SIGTERM')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
  process.exit()
})
process.on('SIGINT', () => {
  logger.info('SIGINT')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
  process.exit()
})

logger.info('Removing package.json')
sh.exec('rm _packaged/package.json')
sh.exec('cp e2e.env _packaged/local.env')

logger.info('Starting server')
runCp = sh.exec(`yarn nyc node server.js`, {
  cwd: '_packaged/src/server',
  shell: '/bin/bash',
  env: {
    ...process.env,
    TEST: 'e2e',
    NODE_ENV: 'production',
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

logger.info('Waiting for server to start')
waitOn({ resources: ['http://localhost:3000'], timeout: 30000 }, (err) => {
  if (err) {
    logger.error(err)
    process.exit(1)
  }

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
