import DataLoader from 'dataloader'
import _ from 'lodash'
import { Filter } from 'mongodb'
import { GameDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameReleaseEntity } from '../../../resolverTypes'

const { keyBy, merge } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameDbEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<GameDbEntity>('game')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map((id) => results[id] ?? null)
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getBy(this: DomainApi, query: any) {
      return await (await this.db())
        .collection<GameDbEntity>('game')
        .find(query)
        .toArray()
    },
    async getAll(this: DomainApi) {
      return await (await this.db())
        .collection<GameDbEntity>('game')
        .find()
        .toArray()
    },
    async updateGameReleases(
      this: DomainApi,
      query: Filter<GameDbEntity>,
      data: Partial<GameReleaseEntity>,
    ) {
      const $set = Object.entries(data).reduce(
        (acc, [key, value]) =>
          merge({}, acc, {
            [`releases.$.${key}`]: value,
          }),
        {},
      )
      return await (await this.db())
        .collection<GameDbEntity>('game')
        .updateMany(query, { $set })
    },
  })
}

export default create
