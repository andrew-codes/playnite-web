import { getDockerTags } from 'versioning'

async function run() {
  const { REGISTRY, OWNER, GITHUB_REF, GITHUB_TOKEN } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF || !GITHUB_TOKEN) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(null, GITHUB_REF)

  await Promise.all(
    tags.map(async (tag) =>
      fetch(
        `https://api.github.com/user/packages/container/${OWNER}%2Fplaynite-web-app/${tag}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        },
      ),
    ),
  )
}

run()
