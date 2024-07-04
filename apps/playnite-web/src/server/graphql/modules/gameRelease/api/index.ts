import DataLoader from 'dataloader'
import { Document, Filter, WithId } from 'mongodb'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameReleaseEntity } from '../../../data/types'

function create(this: DomainApi) {
  const loader = new DataLoader<string, WithId<GameReleaseEntity>>(
    async (ids) => {
      return (await this.db())
        .collection<GameReleaseEntity>('game')
        .find({ id: { $in: ids } })
        .toArray()
    },
  )

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      return (await this.db())
        .collection<GameReleaseEntity>('game')
        .find()
        .toArray()
    },
    async getByName(this: DomainApi, name: string) {
      return (await this.db())
        .collection<GameReleaseEntity>('game')
        .find({ name: name })
        .toArray()
    },
    async getBy(this: DomainApi, query: Filter<Document>) {
      return (await this.db())
        .collection<GameReleaseEntity>('game')
        .find(query)
        .toArray()
    },
  })
}

export default create
