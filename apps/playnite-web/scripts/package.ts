import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' with { type: 'json' }
import packageFiles from './utils/packageFiles'

async function run() {
  packageFiles()
  const { REGISTRY, OWNER, GITHUB_REF, PLATFORM, VERSION, E2E } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF || !PLATFORM) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(VERSION ?? null, GITHUB_REF)

  await Promise.all(
    tags.map(
      async (tag) =>
        new Promise((resolve, reject) => {
          const command = sh.exec(
            `docker buildx build --platform ${PLATFORM} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
            { async: true },
          )
          command.on('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`Failed to build image with tag ${tag}`))
              return
            }
            resolve(true)
          })
        }),
    ),
  )
}

run()
