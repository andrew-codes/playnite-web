import type { Options } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import persistGameAssets from './persistAssets'
import persistGameEntities from './persistGameEntities'
import persistGameEntityRemoval from './persistGameEntityRemoval'

const handlers = (options: Options): IHandlePublishedTopics[] => [
  persistGameEntities,
  persistGameAssets(options),
  persistGameEntityRemoval,
]

export default handlers
