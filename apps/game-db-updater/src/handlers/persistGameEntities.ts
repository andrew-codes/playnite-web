import createDebugger from 'debug'
import _ from 'lodash'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const { isEmpty, uniq } = _

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameEntities',
)

const isPlaylistTag = /playlist-/i

const topicMatch =
  /^playnite\/.*\/entity\/(?<entityType>[a-z0-9\-]+)\/(?<entityId>[a-z0-9\-]+)$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
  try {
    if (!topicMatch.test(topic)) {
      return
    }

    debug(
      `Received game entity for topic ${topic} with payload ${payload.toString()}`,
    )

    const match = topicMatch.exec(topic)
    if (!match?.groups) {
      return
    }

    const { entityType, entityId } = match.groups
    debug(
      `Persisting game entity ${entityType} with id ${entityId} for topic ${topic}`,
    )
    const entity = JSON.parse(payload.toString())

    const collectionName = entityType[0].toLowerCase() + entityType.slice(1)

    const client = await getDbClient()
    await client
      .db('games')
      .collection(collectionName)
      .updateOne({ id: entityId }, { $set: entity }, { upsert: true })
  } catch (e) {
    console.error(e)
  }
}

export default handler
