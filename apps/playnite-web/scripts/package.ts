import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' with { type: 'json' }
import packageFiles from './utils/packageFiles'

async function run() {
  packageFiles()
  const { REGISTRY, OWNER, GITHUB_REF, PLATFORM, VERSION } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF || !PLATFORM) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(VERSION ?? null, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(
      `docker buildx build --platform ${PLATFORM} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
    )
  }
}

run()
