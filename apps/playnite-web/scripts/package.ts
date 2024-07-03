import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' assert { type: 'json' }
import packageFiles from './utils/packageFiles'

async function run() {
  packageFiles()
  const { REGISTRY, OWNER, GITHUB_REF, PLATFORM, E2E } = process.env

  if (E2E === 'true') {
    return
  }

  if (!REGISTRY || !OWNER || !GITHUB_REF) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(pkg.version, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(
      `docker buildx build --platform ${PLATFORM} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
    )
  }
}

run()
