import type { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'
import persistGameAssets from './persistAssets.js'
import persistGameEntities from './persistGameEntities.js'
import persistGameEntityRemoval from './persistGameEntityRemoval.js'
import persistGameReleaseState from './persistGameReleaseState.js'

const handlers = (options: HandlerOptions): IHandlePublishedTopics[] => [
  persistGameEntities(options),
  persistGameAssets(options),
  persistGameEntityRemoval(options),
  persistGameReleaseState(options),
]

export default handlers
