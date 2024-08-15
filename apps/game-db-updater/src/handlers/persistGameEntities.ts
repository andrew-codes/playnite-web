import createDebugger from 'debug'
import _ from 'lodash'
import { v6 as guid } from 'uuid'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const { isEmpty } = _

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
            playlists:
              entity?.tags
                ?.filter((tag) => isPlaylistTag.test(tag.name))
                ?.map((tag) => tag.id) ?? [],
          })
      } else {
        await client
          .db('games')
          .collection<{ releases: string[] }>('consolidated-games')
          .updateOne({ name: entity.name }, { $push: { releases: entityId } })
        const cursor = await client
          .db('games')
          .collection<{ name: string; releases: string[] }>(
            'consolidated-games',
          )
          .aggregate([
            {
              $match: { name: entity.name },
            },
            {
              $project: {
                playlists: {
                  $concatArrays:
                    entity?.tags
                      ?.filter((tag) => isPlaylistTag.test(tag.name))
                      ?.map((tag) => tag.id) ?? [],
                },
              },
            },
          ])

        for await (const doc of cursor) {
          await client
            .db('games')
            .collection<{ name: string; playlists: Array<string> }>(
              'consolidated-games',
            )
            .updateOne(
              { name: entity.name },
              {
                $set: {
                  playlists: doc.playlists ?? [],
                },
              },
            )
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

export default handler
