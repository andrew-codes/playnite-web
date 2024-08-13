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

  await Promise.all(
    tags.flatMap(
      (tag) =>
        new Promise((resolve) => {
          const child = sh.exec(
            `docker buildx build ${process.env.PUBLISH === 'true' ? '--push' : ''} --platform ${PLATFORM} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
            { async: true },
          )
          child.on('exit', resolve)
        }),
    ),
  )
}

run()
