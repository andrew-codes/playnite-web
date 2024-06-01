import semver from 'semver'

const getDockerTags = async (
  version: string,
  ref: string,
): Promise<string[]> => {
  let tags: string[] = []

  if (/^refs\/pull\//.test(ref)) {
    const prNumber = ref
      .replace(/^refs\/pull\//, '')
      .split('/')
      .pop()
    if (prNumber) {
      tags.push(`PR-${prNumber}`)
    }
  } else if (/^refs\/tags\//.test(ref)) {
    const versionTag = semver.major(version)
    tags.push(`${versionTag}-latest`)
  } else if (/^refs\/heads\/main$/.test(ref)) {
    tags.push(`dev`)
  }

  return tags
}

export { getDockerTags }
