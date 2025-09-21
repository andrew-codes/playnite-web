import { spawnSync } from 'child_process'
import path from 'path'

const migrate = async () => {
  const __dirname = import.meta.dirname
  const schemaPath = path.join(__dirname, 'schema.prisma')

  const migrate = spawnSync(
    'npx',
    ['prisma', 'migrate', 'deploy', '--schema', schemaPath],
    {
      stdio: 'inherit',
      env: process.env,
    },
  )
  if (migrate.error) {
    process.exit(1)
  }
  if (migrate.status !== 0) {
    process.exit(migrate.status ?? 1)
  }
}

export { migrate }
