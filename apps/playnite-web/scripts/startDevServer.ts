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
    new Promise((resolve) => {
      sh.exec(
        `kill -9 $(lsof -t -i:24678)`,
        { async: true },
        (code, stdout, stderr) => {
          resolve(code)
        },
      )
    }),
    new Promise((resolve) => {
      sh.exec(
        `kill -9 $(lsof -t -i:3000)`,
        { async: true },
        (code, stdout, stderr) => {
          resolve(code)
        },
      )
    }),
  ])
}
async function run() {
  await setup()
  await new Promise((resolve, reject) => {
    sh.exec(
      `yarn pnpify prisma migrate deploy --schema=src/server/data/providers/postgres/schema.prisma`,
      { async: true },
      (code, stdout, stderr) => {
        if (code !== 0) {
          reject(new Error(`Failed to push database: ${stderr}`))
        } else {
          resolve(stdout)
        }
      },
    )
  })

  nodemon({
    script: path.join('src/server/server.ts'),
    ext: 'ts tsx js jsx json graphql env',
    execMap: {
      js: 'yarn tsx',
      ts: 'yarn tsx',
    },
    watch: [
      path.join('src/server/*.*'),
      path.join('src/server/**/*.*'),
      path.join('*.env'),
      path.join('codegen.ts'),
    ],
    ignore: [
      path.join('src/**/*.webp'),
      path.join('src/**/*.png'),
      path.join('src/**/*.jpg'),
      path.join('src/**/*.jpeg'),
      path.join('src/**/*.gif'),
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
