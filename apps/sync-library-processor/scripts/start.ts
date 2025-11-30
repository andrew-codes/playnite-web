import logger from 'dev-logger'
import nodemon from 'nodemon'
import path from 'path'

async function run() {
  nodemon({
    script: path.join('src/server.ts'),
    ext: 'ts js json env',
    execMap: {
      js: 'yarn tsx',
      ts: 'yarn tsx',
    },
    watch: [path.join('src/*.*'), path.join('src/**/*.*')],
    ignore: [],
    env: {
      ...process.env,
      NODE_ENV: 'development',
      LOG_LEVEL: process.env.LOG_LEVEL ?? '',
      PORT: '3001',
    },
  })

  nodemon
    .on('start', function () {
      logger.info('App is building...')
    })
    .on('quit', function () {
      logger.info('App has quit')
      process.exit()
    })
    .on('restart', function (files) {
      logger.info('App restarted due to: ', files)
    })
}

run().catch((error) => {
  logger.error('FAILURE', error)
  process.exit(1)
})
