import nodemon from 'nodemon'
import path from 'path'
import sh from 'shelljs'

const __dirname = import.meta.dirname

sh.exec(`kill -9 $(lsof -t -i:24678)`)
sh.exec(
  `yarn pnpify prisma generate --schema=src/server/data/providers/postgres/schema.prisma && yarn rimraf {projectRoot}/.generated/prisma/package.json`,
)
sh.exec(`yarn graphql-codegen --config codegen.ts`)

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
    sh.exec(`kill -9 $(lsof -t -i:24678)`)
    sh.exec(
      `yarn pnpify prisma generate --schema=src/server/data/providers/postgres/schema.prisma && yarn rimraf {projectRoot}/.generated/prisma/package.json`,
    )
    sh.exec(`yarn graphql-codegen --config codegen.ts`)
  })
