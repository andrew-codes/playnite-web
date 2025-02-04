import type { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'
import persistGameAssets from './persistAssets.js'
import persistConnection from './persistConnection.js'
import persistGameEntities from './persistGameEntities.js'
import persistGameReleaseState from './persistGameReleaseState.js'

const handlers = (options: HandlerOptions): IHandlePublishedTopics[] => [
  persistGameEntities(options),
  persistGameAssets(options),
  persistGameReleaseState(options),
  persistConnection(options),
]

export default handlers
