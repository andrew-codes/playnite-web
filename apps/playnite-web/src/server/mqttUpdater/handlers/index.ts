import type { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import persistGameAssets from './persistAssets'
import persistGameEntities from './persistGameEntities'
import persistGameEntityRemoval from './persistGameEntityRemoval'
import persistGameReleaseState from './persistGameReleaseState'

const handlers = (options: HandlerOptions): IHandlePublishedTopics[] => [
  persistGameEntities(options),
  persistGameAssets(options),
  persistGameEntityRemoval(options),
  persistGameReleaseState(options),
]

export default handlers
