import DataLoader from 'dataloader'
import _ from 'lodash'
import { autoBind, type DomainApi } from '../../../Domain'
import { FeatureDbEntity } from '../../../data/types'
import { FeatureEntity } from '../../../resolverTypes'

const { omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, FeatureEntity>(async (ids) => {
    const results = await (
      await this.db()
    )
      .collection<FeatureDbEntity>('gamefeature')
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
      }) as Array<FeatureEntity>
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
