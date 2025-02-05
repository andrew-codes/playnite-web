import createDebugger from 'debug'
import { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameReleaseState',
)

const topicMatch =
  /^playnite\/.*\/entity\/Release\/(?<entityId>[a-z0-9\-]+)\/state$/

const runStates = [
  'installed',
  'installing',
  'launching',
  'running',
  'uninstalled',
] as const

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
        const newState = runStates.find((s) => s === state.toLowerCase())

        if (!newState) {
          debug(`Invalid state, ${state}; aborting`)
          return
        }

        if (newState == 'installing') {
          const launchingGame = await options.queryApi.execute({
            entityType: 'Game',
            type: 'AndMatch',
            filterItems: [
              {
                type: 'RelationMatch',
                field: 'releaseIds',
                entityType: 'Game',
                relationType: 'Release',
                filterItem: {
                  entityType: 'Release',
                  type: 'ExactMatch',
                  field: 'id',
                  value: entityId,
                },
              },
              {
                type: 'RelationMatch',
                field: 'releaseIds',
                entityType: 'Game',
                relationType: 'Release',
                filterItem: {
                  entityType: 'Release',
                  type: 'ExactMatch',
                  field: 'runState',
                  value: { id: 'launching' },
                },
              },
            ],
          })

          if (launchingGame) {
            return
          }
        }

        if (newState === 'installed' || newState === 'uninstalled') {
          return
        }

        await options.updateQueryApi.executeUpdate(
          {
            entityType: 'Release',
            type: 'ExactMatch',
            field: 'id',
            value: entityId,
          },
          {
            runState: { id: newState },
            processId: processId,
          },
        )

        options.pubsub.publish('releaseRunStateChanged', {
          id: entityId,
          gameId: gameId,
          processId: processId ?? null,
          runState: newState,
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

export default create
