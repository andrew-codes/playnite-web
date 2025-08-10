import nodemon from 'nodemon'
import path from 'path'
import sh from 'shelljs'

async function setup() {
  return Promise.all([
    new Promise((resolve, reject) => {
      sh.exec(
        `yarn pnpify prisma generate --schema=src/server/data/providers/postgres/schema.prisma`,
        { async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(new Error(`Failed to generate prisma client: ${stderr}`))
          } else {
            resolve(stdout)
          }
        },
      )
    }),
    new Promise((resolve, reject) => {
      sh.exec(
        `yarn graphql-codegen --config codegen.ts`,
        { async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(new Error(`Failed to run graphql codegen: ${stderr}`))
          } else {
            resolve(stdout)
          }
        },
      )
    }),
    new Promise((resolve, reject) => {
      sh.exec(
        `yarn nx db/push playnite-web-app`,
        { async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(new Error(`Failed to push database: ${stderr}`))
          } else {
            resolve(stdout)
          }
        },
      )
    }),
    new Promise((resolve, reject) => {
      sh.exec(
        `kill -9 $(lsof -t -i:24678`,
        { async: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            reject(new Error(`Failed to push database: ${stderr}`))
          } else {
            resolve(stdout)
          }
        },
      )
    }),
  ])
}
async function run() {
  await setup()

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
    ignore: [
      path.join(__dirname, '..', '..', 'src', '**', '*.webp'),
      path.join(__dirname, '..', '..', 'src', '**', '*.png'),
      path.join(__dirname, '..', '..', 'src', '**', '*.jpg'),
      path.join(__dirname, '..', '..', 'src', '**', '*.jpeg'),
      path.join(__dirname, '..', '..', 'src', '**', '*.gif'),
    ],
    env: {
      NODE_ENV: 'development',
      LOG_LEVEL: process.env.LOG_LEVEL ?? '',
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
