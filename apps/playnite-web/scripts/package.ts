import sh from 'shelljs'
import pkg from '../package.json' with { type: 'json' }

async function run() {
  const { LOCAL, GITHUB_SHA, PLATFORM } = process.env
  const REGISTRY = 'ghcr.io'
  const OWNER = 'andrew-codes'
  let tags: Array<string> = []
  const platform = PLATFORM ?? 'linux/amd64,linux/arm64'
  if (LOCAL === 'true') {
    tags = ['local']
  } else {
    if (!GITHUB_SHA) {
      throw new Error('Missing environment variables.')
    }
    tags = [GITHUB_SHA]
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
