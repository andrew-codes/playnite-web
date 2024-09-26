import DataLoader from 'dataloader'
import _ from 'lodash'
import { Filter, UpdateOptions } from 'mongodb'
import { GameReleaseDbEntity, PlaylistDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'

const { keyBy, merge, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, PlaylistDbEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<PlaylistDbEntity>('playlist')
        .find({ id: { $in: ids } })
        .toArray(),
    )

    return ids.map((id) =>
      results[id] ? omit(results[id], '_id') : null,
    ) as Array<PlaylistDbEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      const playlist = await loader.load(id)
    },
    async getAll(this: DomainApi) {
      return (await this.db())
        .collection<PlaylistDbEntity>('playlist')
        .find()
        .toArray()
    },
    async updateGameReleases(
      this: DomainApi,
      query: Filter<PlaylistDbEntity>,
      data: Partial<GameReleaseDbEntity>,
      opts: UpdateOptions,
    ) {
      const $set = Object.entries(data).reduce(
        (acc, [key, value]) =>
          merge({}, acc, {
            [`games.$.releases.$[release].${key}`]: value,
          }),
        {},
      )
      return await (await this.db())
        .collection<PlaylistDbEntity>('playlist')
        .updateMany(query, { $set }, opts)
    },
  })
}

export default create
