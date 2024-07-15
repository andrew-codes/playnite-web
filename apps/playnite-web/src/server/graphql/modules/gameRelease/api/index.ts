import DataLoader from 'dataloader'
import { omit } from 'lodash'
import { Document, Filter } from 'mongodb'
import { GameReleaseDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameReleaseEntity } from '../../../resolverTypes'

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameReleaseEntity>(async (ids) => {
    const releases = await (
      await this.db()
    )
      .collection<GameReleaseDbEntity>('game')
      .find({ id: { $in: ids } })
      .toArray()

    return releases.map((gameRelease) =>
      omit(gameRelease, '_id'),
    ) as Array<GameReleaseEntity>
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
