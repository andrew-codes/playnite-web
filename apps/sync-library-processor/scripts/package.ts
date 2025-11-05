import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json'

async function run() {
  const { LOCAL, VERSION, GITHUB_REF, GITHUB_SHA, PLATFORM } = process.env
  const REGISTRY = 'ghcr.io'
  const OWNER = 'andrew-codes'
  let tags: Array<string> = []
  const platform = PLATFORM ?? 'linux/amd64,linux/arm64'
  if (LOCAL === 'true') {
    tags = ['local']
  } else {
    tags = await getDockerTags(VERSION, GITHUB_REF, GITHUB_SHA)
  }

  await Promise.all(
    tags.flatMap(
      (tag) =>
        new Promise((resolve) => {
          const child = sh.exec(
            `docker buildx build ${process.env.PUBLISH === 'true' ? '--push' : '--load'} --platform ${platform} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file src/Dockerfile .`,
            { async: true },
          )
          child.on('exit', resolve)
        }),
    ),
  )
}

run().catch((error) => {
  console.error('FAILURE.', error)
  process.exit(1)
})
