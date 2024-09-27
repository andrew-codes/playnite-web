import DataLoader from 'dataloader'
import _ from 'lodash'
import { autoBind, type DomainApi } from '../../../Domain'
import { FeatureDbEntity } from '../../../data/types'
import { FeatureEntity } from '../../../resolverTypes'

const { keyBy } = _

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

    return ids.map((id) => results[id] ?? null) as Array<FeatureEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      return (await this.db()).collection('gamefeature').find().toArray()
    },
  })
}

export default create
