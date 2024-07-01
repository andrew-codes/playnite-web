import sh from 'shelljs'

const run = () => {
  sh.mkdir('-p', '_packaged/build')
  sh.cp('server.production.js', '_packaged/')
  sh.cp('-R', 'build/client', '_packaged/build/')
}

export default run
