import DataLoader from 'dataloader'
import _ from 'lodash'
import { Document, Filter } from 'mongodb'
import { autoBind, type DomainApi } from '../../../Domain'
import { PlatformDbEntity } from '../../../data/types'
import { PlatformEntity } from '../../../resolverTypes'

const { keyBy, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, PlatformEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<PlatformDbEntity>('platform')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map((id) =>
      results[id] ? results[id] : null,
    ) as Array<PlatformEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      const items = await (await this.db())
        .collection<PlatformDbEntity>('platform')
        .find()
        .toArray()

      return items as Array<PlatformEntity>
    },
    async getBy(this: DomainApi, query: Filter<Document>) {
      const items = await (await this.db())
        .collection<PlatformDbEntity>('platform')
        .find(query)
        .toArray()

      return items as Array<PlatformEntity>
    },
  })
}

export default create
