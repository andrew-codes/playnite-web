import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import persistGameAssets from './persistAssets'
import persistGameEntities from './persistGameEntities'
import persistGameEntityRemoval from './persistGameEntityRemoval'

const handlers: IHandlePublishedTopics[] = [
  persistGameEntities,
  persistGameAssets,
  persistGameEntityRemoval,
]

export default handlers
