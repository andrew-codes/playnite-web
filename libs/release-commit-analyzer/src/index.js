import { analyzeCommits as originalAnalyze } from '@semantic-release/commit-analyzer'

async function analyzeCommits(pluginConfig, context) {
  const commitResult = await originalAnalyze(pluginConfig, context)

  if (commitResult === 'major') {
    context.logger.log('Breaking change detected in commits, using major')
    return 'major'
  }

  const storyCount = parseInt(process.env.STORY_COUNT ?? '0', 10)
  if (storyCount > 0) {
    context.logger.log(`Story count ${storyCount} > 0, using minor`)
    return 'minor'
  }

  const defectCount = parseInt(process.env.DEFECT_COUNT ?? '0', 10)
  const taskCount = parseInt(process.env.TASK_COUNT ?? '0', 10)
  if (defectCount > 0 || taskCount > 0) {
    context.logger.log(`Defect count ${defectCount} or task count ${taskCount} > 0, using patch`)
    return 'patch'
  }

  return commitResult
}

export { analyzeCommits }
