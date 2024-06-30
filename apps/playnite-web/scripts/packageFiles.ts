import sh from 'shelljs'

async function run() {
  sh.mkdir('-p', '_packaged/build')
  sh.cp('server.production.js', '_packaged/')
  sh.cp('-R', 'build/client', '_packaged/build/')
}

run()
