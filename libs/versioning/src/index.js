const semver = require('semver')
const { isEmpty } = require('lodash')
const sh = require('shelljs')
const debug = require('debug')('playnite-web/versioning')

const getDockerTags = async (version, ref) => {
  debug(`version: ${version}`)
  debug(`ref: ${ref}`)

  let tags = []

  if (/^refs\/pull\//.test(ref)) {
    const prNumber = ref.replace(/^refs\/pull\//, '').replace(/\/merge$/, '')

    if (prNumber) {
      tags.push(`PR-${prNumber}`)
    }
  } else if (/^refs\/heads\/main$/.test(ref)) {
    tags.push(`dev`)
  } else if (/^refs\/heads\/next$/.test(ref)) {
    tags.push(`dev-next`)
  } else if (/^refs\/head\/release-.*/.test(ref)) {
    const nextVersion = ref.replace(/^refs\/heads\/release-/, '')
    tags.push(nextVersion)
    const major = semver.major(nextVersion)
    tags.push(`${major}-latest`)

    const minor = semver.minor(nextVersion)
    tags.push(`${major}.${minor}-latest`)
  }

  if (!isEmpty(version)) {
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

  debug(`tags: ${tags.join(', ')}`)

  return tags
}

module.exports = { getDockerTags }
