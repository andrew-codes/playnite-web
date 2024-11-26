import sh from 'shelljs'

async function run() {
  sh.exec('yarn nx run playnite-web-app:test/components:ci')

  const [, , specFilter] = process.argv
  sh.exec(
    `yarn cypress run --component --browser electron ${specFilter && `--spec src/**/__component_tests__/${specFilter}`}`,
    { env: { ...process.env } },
  )

  sh.exec(
    'yarn cypress-image-diff-html-report start --reportJsonDir visual-regression-tests/component-report --autoOpen',
  )
}

run()
