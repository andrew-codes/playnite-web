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
      results[id] ? omit(results[id], '_id') : null,
    ) as Array<PlatformEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      if (id === '00000000-0000-0000-0000-000000000000') {
        return {
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Unknown',
        }
      }

      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      const items = await (await this.db())
        .collection<PlatformDbEntity>('platform')
        .find()
        .toArray()

      return items.map((item) => omit(item, ['_id'])) as Array<PlatformEntity>
    },
    async getBy(this: DomainApi, query: Filter<Document>) {
      const items = await (await this.db())
        .collection<PlatformDbEntity>('platform')
        .find(query)
        .toArray()

      return items.map((item) => omit(item, ['_id'])) as Array<PlatformEntity>
    },
  })
}

export default create
