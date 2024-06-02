import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' assert { type: 'json' }

async function run() {
  sh.mkdir('-p', '_packaged')
  sh.cp('server.production.js', '_packaged/')
  sh.cp('-R', 'public/', '_packaged/')

  const { REGISTRY, OWNER, GITHUB_REF } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(pkg.version, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(
      `docker build --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
    )
  }
}

run()
