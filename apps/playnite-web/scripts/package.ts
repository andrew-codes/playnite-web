import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' with { type: 'json' }

async function run() {
  const { LOCAL, GITHUB_REF, PLATFORM, VERSION } = process.env
  const REGISTRY = 'ghcr.io'
  const OWNER = 'andrew-codes'
  if (LOCAL !== 'true' && (!REGISTRY || !OWNER || !GITHUB_REF)) {
    throw new Error('Missing environment variables.')
  }
  let tags: Array<string> = []
  const platform = PLATFORM ?? 'linux/amd64,linux/arm64'
  if (LOCAL === 'true') {
    tags = ['local']
  } else {
    tags = await getDockerTags(VERSION ?? null, GITHUB_REF)
  }

  await Promise.all(
    tags.flatMap(
      (tag) =>
        new Promise((resolve, reject) => {
          const child = sh.exec(
            `docker buildx build ${process.env.PUBLISH === 'true' ? '--push' : '--load'} --platform ${platform} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
            { async: true },
          )
          child.on('exit', (code) => {
            if (code !== 0) {
              return reject(new Error(`Build failed with exit code ${code}`))
            }
            return resolve(code)
          })
        }),
    ),
  )
}

run().catch((error) => {
  console.error('FAILURE.', error)
  process.exit(1)
})
