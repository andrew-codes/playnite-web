import createDebugger from 'debug'
import { Binary, ObjectId } from 'mongodb'
import type { IHandlePublishedTopics } from '../IHandlePublishedTopics'
import { getDbClient } from '../dbClient'

const debug = createDebugger('game-db-updater/handler/persistGameEntities')

const topicMatch =
    /^playnite\/.*\/entity\/(?<entityType>.*)\/(?<entityId>.*)\/asset\/(?<assetId>.*)$/

const handler: IHandlePublishedTopics = async (topic, payload) => {
    if (!topicMatch.test(topic)) {
        return
    }

    const match = topicMatch.exec(topic)
    if (!match?.groups) {
        return
    }

    const { assetId, entityType, entityId } = match.groups
    debug(
        `Persisting game entity asset ${entityType} with id ${entityId} and with asset ID ${assetId}`,
    )
    const binaryFile = new Binary(payload)
    const _id = new ObjectId(assetId)
    const relatedId = new ObjectId(entityId)
    const assetDoc = {
        _id: new ObjectId(assetId),
        relatedId,
        relatedType: entityType,
        file: binaryFile,
    }

    const client = await getDbClient()
    client
        .db('games')
        .collection('assets')
        .updateOne({ _id: _id }, { $set: assetDoc }, { upsert: true })
}

export default handler
