import { ChildProcess } from 'child_process'
import sh from 'shelljs'
import waitOn from 'wait-on'

let testCp: ChildProcess | null = null
let runCp: ChildProcess | null = null
process.on('exit', () => {
  console.log('Exiting')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
})
process.on('SIGTERM', () => {
  console.log('SIGTERM')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
  process.exit()
})
process.on('SIGINT', () => {
  console.log('SIGINT')
  runCp?.kill('SIGINT')
  testCp?.kill('SIGINT')
  process.exit()
})

console.log('Removing package.json')
sh.exec('rm _packaged/package.json')
sh.exec('cp e2e.env _packaged/local.env')

console.log('Starting server')
runCp = sh.exec(`yarn nyc node server.js`, {
  cwd: '_packaged/src/server',
  shell: '/bin/bash',
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
  async: true,
})
runCp.stdout?.on('data', (data) => {
  console.log(data)
})
runCp.stderr?.on('data', (data) => {
  console.error(data)
})
runCp.on('close', (code) => {
  console.log('Server closing.')
  if (code !== 0) {
    console.log(`Server exited with code ${code}`)
    process.exit(code)
  }
})
runCp.on('error', (err) => {
  console.error(err)
  if (err) {
    console.error(err)
  }
})

console.log('Waiting for server to start')
waitOn({ resources: ['http://localhost:3000'], timeout: 30000 }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  const [, , specFilter] = process.argv
  console.log('Running Cypress tests')
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
  testCp.stdout?.on('data', (data) => {
    console.log(data)
  })
  testCp.stderr?.on('data', (data) => {
    console.error(data)
  })
  testCp.on('close', (code) => {
    console.log('Cypress tests closing.')
    if (process.env.UPDATE === 'true') {
      console.log('Updating visual regression tests')
      sh.exec(
        `yarn cypress-image-diff-html-report start --reportJsonDir visual-regression-tests/e2e-report --autoOpen`,
      )
    }
    process.exit(code)
  })
})
