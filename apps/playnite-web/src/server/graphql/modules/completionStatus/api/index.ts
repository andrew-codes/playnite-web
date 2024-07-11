import DataLoader from 'dataloader'
import _ from 'lodash'
import { Document, Filter, ObjectId, WithId } from 'mongodb'
import { autoBind, type DomainApi } from '../../../Domain'
import {
  CompletionStatusDbEntity,
  GameReleaseEntity,
} from '../../../data/types'

const { merge, uniqBy } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, WithId<CompletionStatusDbEntity>>(
    async (ids) => {
      return uniqBy(
        await (
          await this.db()
        )
          .collection<GameReleaseEntity>('game')
          .find({ completionStatusId: { $in: ids } })
          .toArray(),
        (gameRelease) => gameRelease.completionStatusId,
      )
        .map((gameRelease) =>
          merge({}, gameRelease.completionStatus, { _id: new ObjectId() }),
        )
        .map((status) => {
          if (status.name) {
            return merge({}, status, { _id: new ObjectId() })
          }

          return merge({}, status, {
            _id: new ObjectId(),
            name: 'Unknown',
          })
        })
    },
  )

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      throw new Error('Not implemented')
    },
    async getBy(this: DomainApi, query: Filter<Document>) {
      throw new Error('Not implemented')
    },
  })
}

export default create
