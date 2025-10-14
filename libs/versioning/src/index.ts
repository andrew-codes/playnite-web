import logger from 'dev-logger'
import { isEmpty } from 'lodash-es'
import semver from 'semver'
import sh from 'shelljs'

const getDockerTags = async (version?: string, ref?: string) => {
  logger.info(`version: ${version}`)
  logger.info(`ref: ${ref}`)

  const tags = [] as Array<string>
  if (!!ref && /^refs\/pull\//.test(ref)) {
    const prNumber = ref.replace(/^refs\/pull\//, '').replace(/\/merge$/, '')

    if (prNumber) {
      tags.push(`PR-${prNumber}`)
    }
  } else if (!!ref && /^refs\/heads\/next$/.test(ref)) {
    tags.push(`dev`)
  } else if (!!ref && /^[0-9a-f]{7,40}$/.test(ref)) {
    tags.push(ref)
  } else if (!!version && !isEmpty(version)) {
    const nextVersion = version.replace(/^v/, '')
    tags.push(nextVersion)

    const major = semver.major(nextVersion)
    tags.push(`${major}-latest`)

    const minor = semver.minor(nextVersion)
    tags.push(`${major}.${minor}-latest`)

    const latestVersion = sh
      .exec(`git tag --sort=-creatordate`)
      .stdout.split('\n')
      .filter((tag) => tag)
      .map((tag) => tag.replace(/^v/, ''))
      .sort(semver.rcompare)[0]

    if (latestVersion === nextVersion) {
      tags.push('latest')
    }
  }

  logger.info(`tags: ${tags.join(', ')}`)

  return tags
}

export { getDockerTags }
