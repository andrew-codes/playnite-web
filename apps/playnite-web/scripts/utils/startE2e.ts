import sh from 'shelljs'
import { getDockerTags } from 'versioning'

async function run() {
  const { REGISTRY, OWNER, GITHUB_REF } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(null, GITHUB_REF)
  const e2eTag = tags[0]
  if (!e2eTag) {
    throw new Error('No tag found for E2E tests.')
  }

  sh.exec(
    `docker run -e DEBUG=\"playnite-web/*\" -v $PWD/public/:/opt/playnite-web-app/public --env-file e2e.env -p 3000:3000 --network host ghcr.io/andrew-codes/playnite-web-app:${e2eTag}`,
  )
}

run()
