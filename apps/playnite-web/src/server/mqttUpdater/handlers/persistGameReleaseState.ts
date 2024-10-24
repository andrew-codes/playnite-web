import createDebugger from 'debug'
import { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'

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
  async (topic, payload) => {
    try {
      if (!topicMatch.test(topic)) {
        return
      }

      debug(
        `Received game release state for topic ${topic} with payload ${payload.toString()}`,
      )

      const { state, release } = JSON.parse(payload.toString())

      const newState = runStates.find((s) => s === state.toLowerCase())

      if (!newState || !release.id) {
        debug(`Invalid state, ${state}, or release id, ${release.id}; aborting`)
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

      if (newState == 'installed') {
        const installingGame = await options.queryApi.execute({
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
        if (installingGame) {
          await options.mqtt.publish(
            `playnite/request/game/start`,
            JSON.stringify({
              game: {
                id: release.id,
                gameId: release.gameId,
                name: release.name,
                platform: {
                  id: release.platform.id,
                  name: release.platform.name,
                },
                source: release.source,
              },
            }),
          )
        }

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
          processId: release.processId ?? null,
        },
      )

      options.pubsub.publish('releaseRunStateChanged', release)
    } catch (e) {
      console.error(e)
    }
  }

export default create
