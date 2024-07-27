import DataLoader from 'dataloader'
import _ from 'lodash'
import { GameAssetDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'

const { groupBy } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameAssetDbEntity>(async (ids) => {
    return (await this.db())
      .collection<GameAssetDbEntity>('assets')
      .find({ id: { $in: ids } })
      .toArray()
  })
  const relatedLoader = new DataLoader<string, Array<GameAssetDbEntity>>(
    async (ids) => {
      const assets = await (
        await this.db()
      )
        .collection<GameAssetDbEntity>('assets')
        .find({ relatedId: { $in: ids } })
        .toArray()

      return Object.values(groupBy(assets, 'relatedId'))
    },
  )

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getByRelation(this: DomainApi, relatedId: string) {
      return relatedLoader.load(relatedId)
    },
  })
}

export default create
