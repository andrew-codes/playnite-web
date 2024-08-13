async function run() {
  const { REGISTRY, OWNER, PR_NUMBER, GITHUB_TOKEN } = process.env

  if (!REGISTRY || !OWNER || !PR_NUMBER || !GITHUB_TOKEN) {
    throw new Error('Missing environment variables')
  }

  const packages = await (
    await fetch(
      `https://api.github.com/users/${OWNER}/packages/container/playnite-web-app/versions?per_page=1000`,
      { method: 'GET', headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } },
    )
  ).json()

  const packageToRemove = packages.find((pkg) =>
    pkg.metadata.container.tags.includes(PR_NUMBER),
  )

  if (!packageToRemove) {
    return
  }

  console.log(
    `Removing package ${packageToRemove.id} with tags ${packageToRemove.metadata.container.tags.join(', ')}`,
  )

  await fetch(
    `https://api.github.com/user/packages/container/${OWNER}/playnite-web-app/versions/${packageToRemove.id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    },
  )
}

run()
