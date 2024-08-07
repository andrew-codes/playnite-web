import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' assert { type: 'json' }

async function run() {
  sh.mkdir('-p', '_packaged/build')
  sh.cp('server.production.js', '_packaged/')
  sh.cp('-R', 'build/client', '_packaged/build/')

  const { REGISTRY, OWNER, GITHUB_REF, PLATFORM } = process.env

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
