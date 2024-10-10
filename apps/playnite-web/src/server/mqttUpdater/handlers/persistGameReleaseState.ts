import createDebugger from 'debug'
import { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

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

      const client = await getDbClient()

      if (newState == 'installing') {
        const launchingGame = await client
          .db('games')
          .collection('game')
          .findOne({
            'release.id': release.id,
            'release.runState': 'launching',
          })
        if (launchingGame) {
          return
        }
      }

      if (newState == 'installed') {
        const installingGame = await client
          .db('games')
          .collection('game')
          .findOne({
            'release.id': release.id,
            'release.runState': 'launching',
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

      await client
        .db('games')
        .collection('game')
        .updateOne(
          { 'releases.id': release.id },
          {
            $set: {
              'releases.$.runState': newState,
              'releases.$.processId': release.processId ?? null,
            },
          },
          { upsert: true },
        )

      await client
        .db('games')
        .collection('playlist')
        .updateMany(
          { 'games.releases.id': release.id },
          {
            $set: {
              [`games.$.releases.$[release].runState`]: newState,
              [`games.$.releases.$[release].processId`]:
                release.processId ?? null,
            },
          },
          {
            arrayFilters: [{ 'release.id': release.id }],
          },
        )

      options.pubsub.publish('releaseRunStateChanged', release)
    } catch (e) {
      console.error(e)
    }
  }

export default create
