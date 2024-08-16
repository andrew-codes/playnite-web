import DataLoader from 'dataloader'
import _ from 'lodash'
import { autoBind, type DomainApi } from '../../../Domain'
import { FeatureDbEntity } from '../../../data/types'
import { FeatureEntity } from '../../../resolverTypes'

const { keyBy, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, FeatureEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<FeatureDbEntity>('gamefeature')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map((id) =>
      results[id] ? omit(results[id], '_id') : null,
    ) as Array<FeatureEntity>
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
  })
}

export default create
