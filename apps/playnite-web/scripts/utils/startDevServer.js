const nodemon = require('nodemon')
const path = require('path')
const sh = require('shelljs')
const { createProjectGraphAsync } = require('@nx/devkit')
const pkg = require('../../package.json')

createProjectGraphAsync().then((graph) => {
  const workspaceDeps = graph.dependencies['playnite-web-app']
    .filter((dep) => graph.nodes[dep.target])
    .filter((dep) => !pkg.devDependencies[dep.target])
    .map((dep) => graph.nodes[dep.target].data.sourceRoot)

  nodemon({
    script: path.join(__dirname, '..', '..', 'server.ts'),
    ext: 'ts tsx js jsx json graphql env',
    execMap: {
      js: 'yarn node',
      ts: 'yarn node --require esbuild-register',
    },
    watch: [
      path.join(__dirname, '..', '..', 'src', 'server', '*.*'),
      path.join(
        __dirname,
        '..',
        '..',
        'src',
        'server',
        'graphql',
        'context.ts',
      ),
      path.join(
        __dirname,
        '..',
        '..',
        'src',
        'server',
        'graphql',
        'modules',
        '**',
        '*.ts',
      ),
      path.join(__dirname, '..', '..', 'src', 'server', 'graphql', 'index.ts'),
      path.join(__dirname, '..', '..', 'server.ts'),
      path.join(__dirname, '..', '..', 'app.ts'),
      path.join(__dirname, '..', '..', '*.env'),
      path.join(
        __dirname,
        '..',
        '..',
        'src',
        'server',
        'graphql',
        'modules',
        '**',
        '*.graphql',
      ),
      path.join(__dirname, '..', '..', 'codegen.ts'),
    ].concat(
      workspaceDeps.map((p) => path.join(__dirname, '..', '..', '..', '..', p)),
    ),
    env: {
      NODE_ENV: 'development',
      DEBUG: process.env.DEBUG,
    },
  })

  nodemon
    .on('start', function () {
      console.log('App is building...')
    })
    .on('quit', function () {
      console.log('App has quit')
      process.exit()
    })
    .on('restart', function (files) {
      sh.exec(`yarn nx run playnite-web-app:prepare`)
    })
})
