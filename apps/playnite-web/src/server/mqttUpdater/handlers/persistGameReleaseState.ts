import createDebugger from 'debug'
import { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameReleaseState',
)

const topicMatch =
  /^playnite\/.*\/entity\/Release\/(?<entityId>[a-z0-9\-]+)\/state$/

const create =
  (options: HandlerOptions): IHandlePublishedTopics =>
  async (messages) => {
    for (const { topic, payload } of messages) {
      try {
        const match = topicMatch.exec(topic)
        if (!match) {
          return
        }

        const { entityId } = match.groups as { entityId: string }
        if (!entityId) {
          console.error('Invalid entityId for Release state topic:', entityId)
          return
        }
        const { state, processId, gameId } = JSON.parse(payload.toString())
        if (!state) {
          console.error('Invalid state for Release state topic:', state)
          return
        }

        debug(
          `Received game release state for topic ${entityId} with state value of ${state}`,
        )

        if (state === 'running') {
          await options.updateQueryApi.executeUpdate(
            {
              entityType: 'Release',
              type: 'ExactMatch',
              field: 'id',
              value: entityId,
            },
            { playniteWebRunState: 'running' },
          )
          options.pubsub.publish('playniteWebRunStateUpdated', {
            id: entityId,
            runState: 'running',
          })
        }

        options.pubsub.publish('releaseRunStateChanged', {
          id: entityId,
          gameId: gameId,
          processId: processId ?? null,
          runState: state.toLowerCase(),
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

export default create
