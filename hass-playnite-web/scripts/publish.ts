import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json'

async function run() {
  sh.cp('-R', '.dist/', '_packaged/')

  const { REGISTRY, OWNER, GITHUB_REF, PLATFORM, VERSION } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF || !PLATFORM || !VERSION) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(VERSION, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(
      `docker buildx build --push --platform ${PLATFORM} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile --build-arg VERSION=${tag} .`,
    )
  }
}

run()
