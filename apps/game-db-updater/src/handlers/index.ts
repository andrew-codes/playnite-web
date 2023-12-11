import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import debugHandler from './debug'

const handlers: IHandlePublishedTopics[] = [debugHandler]

export default handlers
