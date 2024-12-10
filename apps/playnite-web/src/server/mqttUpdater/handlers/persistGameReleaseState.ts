import createDebugger from 'debug'
import { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics.js'

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameReleaseState',
)

const topicMatch = /^playnite\/.*\/response\/game\/state$/

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
        if (!topicMatch.test(topic)) {
          return
        }

        debug(
          `Received game release state for topic ${topic} with payload ${payload.toString()}`,
        )

        const { state, release } = JSON.parse(payload.toString())

        if (release === null) {
          debug('Release is null; aborting')
          return
        }

        const newState = runStates.find((s) => s === state.toLowerCase())

        if (!newState || !release.id) {
          debug(
            `Invalid state, ${state}, or release id, ${release.id}; aborting`,
          )
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
                  value: release.id,
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
            value: release.id,
          },
          {
            runState: { id: newState },
            processId: release.processId,
          },
        )

        options.pubsub.publish('releaseRunStateChanged', {
          id: release.id,
          gameId: release.gameId,
          processId: release.processId ?? null,
          runState: newState,
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

export default create
