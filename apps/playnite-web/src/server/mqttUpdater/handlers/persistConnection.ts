import createDebugger from 'debug'
import { isEmpty } from 'lodash-es'
import { HandlerOptions } from '..'
import { UpdateFilterItem } from '../../data/types.api'
import { Entity, StringFromType } from '../../data/types.entities.js'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistConnection',
)

const topicMatch = /^playnite\/.*\/connection$/

const create =
  (options: HandlerOptions): IHandlePublishedTopics =>
  async (messages) => {
    const messagesToHandle = messages.filter(({ topic }) =>
      topicMatch.test(topic),
    )
    if (isEmpty(messagesToHandle)) {
      return
    }

    for (const { topic, payload } of messagesToHandle) {
      try {
        debug(`Received connection event`)

        const match = topicMatch.exec(topic)
        if (!match) {
          console.error('Invalid topic:', topic)
          return
        }

        const { clientId, state } = JSON.parse(payload.toString())
        debug('Dropping old connection states')
        await options.deleteQueryApi.executeDelete({
          type: 'MatchAll',
          entityType: 'Connection',
        })

        debug(
          `Update connection with client ID ${clientId} as ${state === 'online' ? 'online' : 'offline'}`,
        )

        await options.updateQueryApi.executeUpdate(
          {
            type: 'ExactMatch',
            entityType: 'Connection' as StringFromType<Entity>,
            field: 'id',
            value: clientId,
          } as UpdateFilterItem<StringFromType<Entity>>,
          {
            id: clientId,
            state: state === 'online',
          },
        )
      } catch (error) {
        debug(`Error processing topic ${topic}`)
        console.error(error)
      }
    }
  }

export default create
export { topicMatch }
