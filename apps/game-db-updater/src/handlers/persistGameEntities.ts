import createDebugger from 'debug'
import { merge } from 'lodash'
import { ObjectId } from 'mongodb'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const debug = createDebugger('game-db-updater/handler/persistGameEntities')

const topicMatch = /^playnite\/.*\/entity\/(?<entityType>.*)\/(?<entityId>.*)$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
    if (!topicMatch.test(topic)) {
        return
    }

    const match = topicMatch.exec(topic)
    if (!match?.groups) {
        return
    }

    const { entityType, entityId } = match.groups
    const entity = JSON.parse(payload.toString())
    debug(
        `Persisting game entity ${entityType} with id ${entityId} received: ${JSON.stringify(
            entity,
            null,
            2,
        )}`,
    )
    const _id = new ObjectId(entityId)

    const client = await getDbClient()
    client
        .db('games')
        .collection(entityType)
        .updateOne(
            { _id: _id },
            { $set: merge({}, entity, { _id }) },
            { upsert: true },
        )
}

export default handler
