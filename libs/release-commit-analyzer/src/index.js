import { analyzeCommits as originalAnalyze } from '@semantic-release/commit-analyzer'

async function analyzeCommits(pluginConfig, context) {
  const commitResult = await originalAnalyze(pluginConfig, context)

  if (commitResult === 'major') {
    context.logger.log('Breaking change detected in commits, using major')
    return 'major'
  }

  const releaseType = process.env.RELEASE_TYPE
  if (releaseType) {
    context.logger.log(`Using Jira release type: ${releaseType}`)
    return releaseType
  }

  return commitResult
}

export { analyzeCommits }
