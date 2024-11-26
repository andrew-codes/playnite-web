import sh from 'shelljs'

async function run() {
  sh.exec(`yarn nx run playnite-web-app:test/e2e:ci/local`)
}

run()
