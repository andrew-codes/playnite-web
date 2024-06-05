const semver = require('semver')
const { groupBy } = require('lodash')
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
    const minor = semver.minor(version)
    tags.push(`${major}.${minor}-latest`)

    const latestMajors = Object.entries(
      groupBy(
        sh
          .exec(`git tag --sort=-creatordate`)
          .stdout.split('\n')
          .filter((tag) => tag)
          .map((tag) => tag.replace(/^v/, ''))
          .sort(semver.rcompare),
        semver.major,
      ),
    ).map(([major, tags]) => [
      major,
      tags.filter((tag) => !semver.eq(version, tag))[0],
    ])
    debug(`latestMajors: ${JSON.stringify(latestMajors, null, 2)}`)

    const matchingLatestMajor = latestMajors.find(
      ([major, tag]) =>
        major === semver.major(version).toString() && semver.gt(version, tag),
    )
    if (matchingLatestMajor) {
      tags.push(`${matchingLatestMajor[0]}-latest`)
    }
  } else if (/^refs\/heads\/main$/.test(ref)) {
    tags.push(`dev`)
  }

  debug(`tags: ${tags.join(', ')}`)

  return tags
}

module.exports = { getDockerTags }
