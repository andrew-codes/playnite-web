import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json'

async function run() {
  sh.cp('-R', '.dist/', '_packaged/')

  const { REGISTRY, OWNER, GITHUB_REF, PLATFORM } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(pkg.version, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(
      `docker build --platform ${PLATFORM} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
    )
  }
}

run()
