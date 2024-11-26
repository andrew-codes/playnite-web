import sh from 'shelljs'

async function run() {
  const [, , specFilter] = process.argv
  sh.exec(
    `yarn cypress run --component --browser electron ${specFilter && `--spec src/**/__component_tests__/${specFilter}`}`,
  )

  sh.exec(
    'yarn cypress-image-diff-html-report start --reportJsonDir visual-regression-tests/component-report --autoOpen',
  )
}

run()
