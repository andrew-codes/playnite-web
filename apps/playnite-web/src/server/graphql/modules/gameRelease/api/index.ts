import DataLoader from 'dataloader'
import _ from 'lodash'
import { Document, Filter } from 'mongodb'
import { GameReleaseDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameReleaseEntity } from '../../../resolverTypes'

const { keyBy, merge } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameReleaseEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<GameReleaseDbEntity>('release')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map(
      (id) => (results[id] as unknown as GameReleaseEntity) ?? null,
    )
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      return (await this.db())
        .collection<GameReleaseDbEntity>('release')
        .find()
        .toArray()
    },
    async getByName(this: DomainApi, name: string) {
      return (await this.db())
        .collection<GameReleaseDbEntity>('release')
        .find({ name: name })
        .toArray()
    },
    async getBy(this: DomainApi, query: Filter<Document>) {
      return (await this.db())
        .collection<GameReleaseDbEntity>('release')
        .find(query)
        .toArray()
    },
  })
}

export default create
