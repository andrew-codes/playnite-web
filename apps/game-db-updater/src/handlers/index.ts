import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import debugHandler from './debug'
import persistGameAssets from './persistGameAssets'
import persistGameEntities from './persistGameEntities'

const handlers: IHandlePublishedTopics[] = [
  debugHandler,
  persistGameEntities,
  persistGameAssets,
]

export default handlers
