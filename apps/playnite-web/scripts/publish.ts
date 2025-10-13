import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' with { type: 'json' }

async function run() {
  const { GITHUB_SHA, VERSION } = process.env
  if (!VERSION) {
    throw new Error('Missing VERSION environment variable.')
  }
  if (!GITHUB_SHA) {
    throw new Error('Missing GITHUB_SHA environment variable.')
  }
  const REGISTRY = 'ghcr.io'
  const OWNER = 'andrew-codes'
  let tags: Array<string> = []
  tags = await getDockerTags(VERSION)

  const sourceImage = `${REGISTRY}/${OWNER}/${pkg.name}:${GITHUB_SHA}`

  sh.exec(`docker pull ${sourceImage}`, { silent: false })

  // Tag the existing image with all version tags
  await Promise.all(
    tags.map(
      (tag) =>
        new Promise((resolve, reject) => {
          const targetImage = `${REGISTRY}/${OWNER}/${pkg.name}:${tag}`
          const child = sh.exec(`docker tag ${sourceImage} ${targetImage}`, {
            async: true,
            silent: false,
          })
          child.on('exit', (code) => {
            if (code !== 0) {
              return reject(new Error(`Tagging failed with exit code ${code}`))
            }
            return resolve(code)
          })
        }),
    ),
  )

  // Push all tags if PUBLISH is true
  await Promise.all(
    tags.map(
      (tag) =>
        new Promise((resolve, reject) => {
          const targetImage = `${REGISTRY}/${OWNER}/${pkg.name}:${tag}`
          const child = sh.exec(`docker push ${targetImage}`, {
            async: true,
            silent: false,
          })
          child.on('exit', (code) => {
            if (code !== 0) {
              return reject(new Error(`Push failed with exit code ${code}`))
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
