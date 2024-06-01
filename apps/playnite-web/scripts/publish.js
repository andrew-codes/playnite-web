import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' with { type: 'json' }

async function run() {
  const { REGISTRY, OWNER, GITHUB_REF } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(pkg.version, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(`docker push "${REGISTRY}/${OWNER}/playnite-web-app:${tag}"`)
  }
}

run()
