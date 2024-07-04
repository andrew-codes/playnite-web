import DataLoader from 'dataloader'
import { Document, Filter, WithId } from 'mongodb'
import { autoBind, type DomainApi } from '../../../Domain'
import { PlatformEntity } from '../../../data/types'

function create(this: DomainApi) {
  const loader = new DataLoader<string, WithId<PlatformEntity>>(async (ids) => {
    return (await this.db())
      .collection<PlatformEntity>('platform')
      .find({ id: { $in: ids } })
      .toArray()
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      return (await this.db())
        .collection<PlatformEntity>('platform')
        .find()
        .toArray()
    },
    async getBy(this: DomainApi, query: Filter<Document>) {
      return (await this.db())
        .collection<PlatformEntity>('platform')
        .find(query)
        .toArray()
    },
  })
}

export default create
