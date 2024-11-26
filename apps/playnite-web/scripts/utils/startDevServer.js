import nodemon from 'nodemon'
import path from 'path'
import sh from 'shelljs'

const __dirname = import.meta.dirname

nodemon({
  script: path.join(__dirname, '..', '..', 'src', 'server', 'server.ts'),
  ext: 'ts tsx js jsx json graphql env',
  execMap: {
    js: 'yarn tsx',
    ts: 'yarn tsx',
  },
  watch: [
    path.join(__dirname, '..', '..', 'src', 'server', '*.*'),
    path.join(__dirname, '..', '..', 'src', 'server', '**', '*.*'),
    path.join(__dirname, '..', '..', '*.env'),
    path.join(__dirname, '..', '..', 'codegen.ts'),
  ],
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
