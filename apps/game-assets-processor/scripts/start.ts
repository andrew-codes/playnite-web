import nodemon from 'nodemon'
import path from 'path'

async function setup() {}
async function run() {
  await setup()

  nodemon({
    script: path.join('src/server.ts'),
    ext: 'ts js json env',
    execMap: {
      js: 'yarn tsx',
      ts: 'yarn tsx',
    },
    watch: [path.join('src/*.*'), path.join('src/**/*.*')],
    ignore: [
      path.join('**/*.webp'),
      path.join('**/*.png'),
      path.join('**/*.jpg'),
      path.join('**/*.jpeg'),
      path.join('**/*.gif'),
    ],
    env: {
      NODE_ENV: 'development',
      LOG_LEVEL: process.env.LOG_LEVEL ?? '',
      ...process.env,
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
      setup()
    })
}

run().catch((error) => {
  console.error('FAILURE', error)
  process.exit(1)
})
