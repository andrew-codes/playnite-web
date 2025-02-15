import { filterRevertedCommitsSync } from 'conventional-commits-filter'
import { CommitParser } from 'conventional-commits-parser'
import createDebugger from 'debug'
import fs from 'fs'
import { find, merge } from 'lodash-es'
import { join } from 'path'
import { readPackageUp } from 'read-package-up'
import { pipeline } from 'stream/promises'
import { format } from 'url'
import { parse, stringify } from 'yaml'
import HOSTS_CONFIG from './hosts-config.js'
import loadChangelogConfig from './load-changelog-config.js'

const debug = createDebugger(
  'semantic-release:@andrew-codes/playnite-plugin-installer-manifest',
)

const verifyRelease = async (pluginConfig, context) => {
  const { commits, lastRelease, nextRelease, options, cwd } = context
  const repositoryUrl = options.repositoryUrl
    .replace(/\.git$/i, '')
    .replace(/https:\/\/.*@/i, 'https://')
  const { parserOpts } = await loadChangelogConfig(pluginConfig, context)

  const [match, auth, host, path] =
    /^(?!.+:\/\/)(?:(?<auth>.*)@)?(?<host>.*?):(?<path>.*)$/.exec(
      repositoryUrl,
    ) || []
  let { hostname, port, pathname, protocol } = new URL(
    match ? `ssh://${auth ? `${auth}@` : ''}${host}/${path}` : repositoryUrl,
  )
  port = protocol.includes('ssh') ? '' : port
  protocol = protocol && /http[^s]/.test(protocol) ? 'http' : 'https'
  const [, owner, repository] =
    /^\/(?<owner>[^/]+)?\/?(?<repository>.+)?$/.exec(pathname)

  const { issue, commit, referenceActions, issuePrefixes } =
    find(HOSTS_CONFIG, (conf) => conf.hostname === hostname) ||
    HOSTS_CONFIG.default
  const parser = new CommitParser({
    referenceActions,
    issuePrefixes,
    ...parserOpts,
  })
  const parsedCommits = filterRevertedCommitsSync(
    commits
      .filter(({ message, hash }) => {
        if (!message.trim()) {
          debug('Skip commit %s with empty message', hash)
          return false
        }

        return true
      })
      .map((rawCommit) => ({
        ...rawCommit,
        ...parser.parse(rawCommit.message),
      })),
  )
  const previousTag = lastRelease.gitTag || lastRelease.gitHead
  const currentTag = nextRelease.gitTag || nextRelease.gitHead
  const {
    host: hostConfig,
    linkCompare,
    linkReferences,
    commit: commitConfig,
    issue: issueConfig,
  } = pluginConfig
  const changelogContext = merge(
    {
      version: nextRelease.version,
      host: format({ protocol, hostname, port }),
      owner,
      repository,
      previousTag,
      currentTag,
      linkCompare: currentTag && previousTag,
      issue,
      commit,
      packageData: ((await readPackageUp({ normalize: false, cwd })) || {})
        .packageJson,
    },
    {
      host: hostConfig,
      linkCompare,
      linkReferences,
      commit: commitConfig,
      issue: issueConfig,
    },
  )

  debug('version: %o', changelogContext.version)
  debug('host: %o', changelogContext.hostname)
  debug('owner: %o', changelogContext.owner)
  debug('repository: %o', changelogContext.repository)
  debug('previousTag: %o', changelogContext.previousTag)
  debug('currentTag: %o', changelogContext.currentTag)
  debug('host: %o', changelogContext.host)
  debug('linkReferences: %o', changelogContext.linkReferences)
  debug('issue: %o', changelogContext.issue)
  debug('commit: %o', changelogContext.commit)

  const { manifestFilePath, extensionFilePath, requiredApiVersion } =
    pluginConfig

  const extension = parse(
    fs.readFileSync(join(context.cwd, extensionFilePath), 'utf8'),
  )
  const nextPackage = {
    Version: nextRelease.version,
    PackageUrl: `${repositoryUrl}/releases/download/v${nextRelease.version}/${
      extension.Id
    }_${nextRelease.version.replace(/\./g, '_')}.pext`,
    ReleaseDate: new Date().toISOString().split('T')[0],
    RequiredApiVersion: requiredApiVersion,
    Changelog: [],
  }
  await pipeline(parsedCommits, async function* (changelog) {
    for await (const chunk of changelog) {
      if (!chunk.type) {
        continue
      }
      nextPackage.Changelog.push(chunk.header)
    }
  })

  const manifest = parse(
    fs.readFileSync(join(context.cwd, manifestFilePath), 'utf8'),
  )
  manifest.Packages = manifest.Packages.filter(
    (pkg) => pkg.Version !== nextRelease.version,
  )
  manifest.Packages.push(nextPackage)
  const newManifest = stringify(manifest)
  debug(newManifest)
  if (options.dryRun) {
    return
  }
  fs.writeFileSync(join(context.cwd, manifestFilePath), newManifest, 'utf-8')
}

export { verifyRelease }
