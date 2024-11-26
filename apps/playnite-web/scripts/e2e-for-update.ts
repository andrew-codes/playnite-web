import sh from 'shelljs'
async function run() {
  sh.exec('yarn nx run playnite-web-app:start/services:ci')
  sh.exec('yarn nx run playnite-web-app:package/instrumented')

  const [, , specFilter] = process.argv
  sh.exec(
    `yarn start-server-and-test 'yarn cross-env DEBUG=\"playnite*\" NODE_ENV=production yarn node _packaged/server.production.cjs' http://localhost:3000 'yarn cross-env TEST=e2e CI=true LOCAL=true yarn cypress run --e2e --browser electron ${specFilter && `--spec cypress/e2e/**/${specFilter}`}'`,
  )

  sh.exec(
    `yarn cypress-image-diff-html-report start --reportJsonDir visual-regression-tests/e2e-report --autoOpen`,
  )
}

run()
