import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/schema.prisma',
  migrations: {
    path: 'src/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
