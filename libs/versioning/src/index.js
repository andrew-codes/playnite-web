const semver = require('semver')
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
  } else if (/^refs\/tags\//.test(ref)) {
    tags.push(version)

    const major = semver.major(version)
    tags.push(`${major}-latest`)

    const minor = semver.minor(version)
    tags.push(`${major}.${minor}-latest`)

    const latestVersion = sh
      .exec(`git tag --sort=-creatordate`)
      .stdout.split('\n')
      .filter((tag) => tag)
      .map((tag) => tag.replace(/^v/, ''))
      .sort(semver.rcompare)[0]

    if (latestVersion === version) {
      tags.push('latest')
    }
  } else if (/^refs\/heads\/main$/.test(ref)) {
    tags.push(`dev`)
  }

  debug(`tags: ${tags.join(', ')}`)

  return tags
}

module.exports = { getDockerTags }
