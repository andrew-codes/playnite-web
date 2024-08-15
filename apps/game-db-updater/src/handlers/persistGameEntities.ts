import createDebugger from 'debug'
import _ from 'lodash'
import { v6 as guid } from 'uuid'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const { isEmpty } = _

const debug = createDebugger(
  'playnite-web/game-db-updater/handler/persistGameEntities',
)

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

    if (collectionName === 'game') {
      const consolidatedGames = await client
        .db('games')
        .collection('consolidated-games')
        .find({ name: entity.name })
        .toArray()

      if (isEmpty(consolidatedGames)) {
        const id = guid()
        await client
          .db('games')
          .collection('consolidated-games')
          .insertOne({
            id,
            name: entity.name,
            releases: [entityId],
            description: entity.description,
            cover: entity.cover,
          })
      } else {
        await client
          .db('games')
          .collection<{ releases: string[] }>('consolidated-games')
          .updateOne({ name: entity.name }, { $push: { releases: entityId } })
      }
    }
  } catch (e) {
    console.error(e)
  }
}

export default handler
