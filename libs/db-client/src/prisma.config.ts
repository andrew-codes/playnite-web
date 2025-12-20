import path from 'path'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
