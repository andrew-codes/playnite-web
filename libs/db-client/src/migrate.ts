import { spawnSync } from 'child_process'
import path from 'path'

const migrate = async (configPath?: string) => {
  const pathToConfig = configPath ?? 'prisma.config.ts'

  const migrate = spawnSync(
    'npx',
    ['prisma', 'migrate', 'deploy', '--config', pathToConfig],
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
