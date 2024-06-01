import path from 'path'
import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json'

async function run() {
  const projectRoot = path.join(__dirname, '../')
  process.chdir(projectRoot)

  sh.cp('-R', '.dist/', '_packaged/')

  const { REGISTRY, OWNER, GITHUB_REF } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(pkg.version, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(
      `docker build --tag "${REGISTRY}/${OWNER}/playnite-web-game-db-updater:${tag}" -file Dockerfile .`,
    )
  }
}

run()
