import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import debugHandler from './debug'
import persistGameAssets from './persistGameAssets'
import persistGameEntities from './persistGameEntities'
import persistGameEntityRemoval from './persistGameEntityRemoval'

const handlers: IHandlePublishedTopics[] = [
  debugHandler,
  persistGameEntities,
  persistGameAssets,
  persistGameEntityRemoval,
]

export default handlers
