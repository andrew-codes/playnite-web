import createDebugger from 'debug'
import _ from 'lodash'
import { v6 as guid } from 'uuid'
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

    await client
      .db('games')
      .createIndex(collectionName, { id: 1 }, { unique: true })
    await client.db('games').createIndex(collectionName, { name: 1 })

    if (collectionName === 'game') {
      await client
        .db('games')
        .createIndex('consolidated-games', { id: 1 }, { unique: true })
      await client
        .db('games')
        .createIndex('consolidated-games', { name: 1 }, { unique: true })
      let consolidatedGame = await client
        .db('games')
        .collection('consolidated-games')
        .findOne({ name: entity.name })

      if (!consolidatedGame) {
        const id = guid()
        await client.db('games').collection('consolidated-games').insertOne({
          id,
          name: entity.name,
          releases: [],
          description: entity.description,
          playlists: [],
        })
      }

      consolidatedGame = await client
        .db('games')
        .collection<{
          releases: string[]
          playlists: string[]
        }>('consolidated-games')
        .findOne({ name: entity.name })

      if (!consolidatedGame) {
        console.error(
          `Could not find consolidated game for game ${entity.name}`,
          JSON.stringify(entity, null, 2),
        )
        return
      }

      await client
        .db('games')
        .collection<{ name: string; releases: Array<string> }>(
          'consolidated-games',
        )
        .updateOne(
          { _id: consolidatedGame._id },
          {
            $set: {
              releases: uniq(
                [entityId].concat(consolidatedGame.releases ?? []),
              ),
            },
          },
        )

      const playlists =
        entity?.tags
          ?.filter((tag) => isPlaylistTag.test(tag.name))
          ?.map((tag) => tag.id) ?? []
      await client
        .db('games')
        .collection<{ name: string; playlists: Array<string> }>(
          'consolidated-games',
        )
        .updateOne(
          { _id: consolidatedGame._id },
          {
            $set: {
              playlists: uniq(
                playlists.concat(consolidatedGame.playlists ?? []),
              ),
            },
          },
        )
    }
  } catch (e) {
    console.error(e)
  }
}

export default handler
