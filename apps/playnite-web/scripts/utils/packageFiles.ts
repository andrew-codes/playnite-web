import sh from 'shelljs'

const run = () => {
  sh.mkdir('-p', '_packaged/build')
  sh.cp('server.production.js', '_packaged/')
  sh.cp('-R', 'build/client', '_packaged/build/')
  sh.rm('-rf', '_packaged/build/client/assets/asset-by-id')

  sh.mkdir('-p', '_packaged/public/assets')
  sh.cp('-R', 'public/assets/', '_packaged/public/')
  sh.rm('-rf', '_packaged/public/assets/asset-by-id/*.*')
}

export default run
