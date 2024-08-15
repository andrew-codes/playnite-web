import DataLoader from 'dataloader'
import _ from 'lodash'
import { Document, Filter } from 'mongodb'
import { GameReleaseDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameReleaseEntity } from '../../../resolverTypes'

const { omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameReleaseEntity>(async (ids) => {
    const results = await (
      await this.db()
    )
      .collection<GameReleaseDbEntity>('game')
      .find({ id: { $in: ids } })
      .toArray()

    return results
      .map((item) => omit(item, '_id'))
      .sort((a, b) => {
        const aSort = ids.findIndex((id) => id === a.id)
        const bSort = ids.findIndex((id) => id === b.id)
        if (aSort > bSort) {
          return 1
        }
        if (aSort < bSort) {
          return -1
        }
        return 0
      }) as Array<GameReleaseEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      const releases = await (await this.db())
        .collection<GameReleaseEntity>('game')
        .find()
        .toArray()

      return releases.map((gameRelease) => omit(gameRelease, '_id'))
    },
    async getByName(this: DomainApi, name: string) {
      const releases = await (await this.db())
        .collection<GameReleaseEntity>('game')
        .find({ name: name })
        .toArray()

      return releases.map((gameRelease) => omit(gameRelease, '_id'))
    },
    async getBy(this: DomainApi, query: Filter<Document>) {
      const releases = await (await this.db())
        .collection<GameReleaseEntity>('game')
        .find(query)
        .toArray()

      return releases.map((gameRelease) => omit(gameRelease, '_id'))
    },
  })
}

export default create
