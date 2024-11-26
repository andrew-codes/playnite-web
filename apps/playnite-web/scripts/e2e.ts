import { ChildProcess } from 'child_process'
import createDebugger from 'debug'
import sh from 'shelljs'

const testDebug = createDebugger('nx/test')
const runDebug = createDebugger('nx/run')

async function run() {
  let testCp: ChildProcess | null = null
  let runCp: ChildProcess | null = null
  process.on('exit', () => {
    runCp?.kill('SIGINT')
    testCp?.kill('SIGINT')
  })
  process.on('SIGTERM', () => {
    runCp?.kill('SIGINT')
    testCp?.kill('SIGINT')
  })
  process.on('SIGINT', () => {
    runCp?.kill('SIGINT')
    testCp?.kill('SIGINT')
    process.exit()
  })

  sh.exec('rm _packaged/package.json')
  sh.exec('cp e2e.env _packaged/local.env')
  sh.exec(`cp -r ../../.data/asset-by-id ./_packaged/src/public/assets`)

  runCp = sh.exec(`yarn node server.js`, {
    cwd: '_packaged/src/server',
    env: {
      ...process.env,
      DEBUG: 'playnite*',
      NODE_ENV: 'production',
    },
    async: true,
  })
  runCp.stdout?.on('data', (data) => {
    runDebug(data)
  })
  runCp.stderr?.on('data', (data) => {
    runDebug(data)
  })
  runCp.on('close', (code) => {
    if (code !== 0) {
      runDebug(`Server exited with code ${code}`)
    }
  })

  sh.exec(`yarn wait-on http://localhost:3000`)
  const [, , specFilter] = process.argv
  testCp = sh.exec(
    `yarn cypress ${process.env.CMD ?? 'run'} --e2e --browser electron ${specFilter && `--spec cypress/e2e/**/${specFilter}`}`,
    {
      env: { ...process.env },
      async: true,
    },
  )
  testCp.stdout?.on('data', (data) => {
    testDebug(data)
  })
  testCp.stderr?.on('data', (data) => {
    testDebug(data)
  })
  testCp.on('close', (code) => {
    if (process.env.UPDATE === 'true') {
      sh.exec(
        `yarn cypress-image-diff-html-report start --reportJsonDir visual-regression-tests/e2e-report --autoOpen`,
      )
    }

    process.exit(code)
  })
}

run()
