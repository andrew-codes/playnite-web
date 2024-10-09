import createDebugger from 'debug'
import _ from 'lodash'
import { HandlerOptions } from '..'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const { merge } = _

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameReleaseState',
)

const topicMatch = /^playnite\/.*\/response\/game\/state$/

const runStates = [
  'installed',
  'installing',
  'launching',
  'running',
  'uninstalling',
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

      const { game, state, releaseId } = JSON.parse(payload.toString())

      if (state.toLowerCase() === 'stopped') {
        ;(game as any).releases = (game as any).releases.map((r: any) =>
          merge({}, r, { processId: null }),
        )
      }
      const newState =
        runStates.find((s) => s === state.toLowerCase()) ?? 'uninstalled'

      const client = await getDbClient()
      await client
        .db('games')
        .collection('game')
        .updateOne(
          { id: game.id },
          { $set: merge({}, game, { runState: newState }) },
          { upsert: true },
        )

      await client
        .db('games')
        .collection('playlist')
        .updateMany(
          { 'games.id': game.id },
          {
            $set: {
              [`games.$`]: game,
            },
          },
        )

      const release = game.releases.find((r: any) => r.id === releaseId)
      if (!release) {
        debug('No release found for game in run state change.')
        return
      }

      options.publisher.publish('releaseRunStateChanged', release)
    } catch (e) {
      console.error(e)
    }
  }

export default create
