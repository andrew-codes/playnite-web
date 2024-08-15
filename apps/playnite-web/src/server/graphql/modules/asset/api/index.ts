import DataLoader from 'dataloader'
import _ from 'lodash'
import { GameAssetDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameAssetType } from '../../../resolverTypes'

const { groupBy, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameAssetDbEntity>(async (ids) => {
    const results = await (
      await this.db()
    )
      .collection<GameAssetDbEntity>('assets')
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
      }) as Array<GameAssetDbEntity>
  })
  const relatedCoverLoader = new DataLoader<string, GameAssetDbEntity>(
    async (ids) => {
      const assets = await (
        await this.db()
      )
        .collection<GameAssetDbEntity>('assets')
        .find({ relatedId: { $in: ids }, typeKey: 'cover' })
        .toArray()

      const assetsById = groupBy(assets, 'relatedId')

      return ids.map((id) => assetsById[id]?.[0] ?? null)
    },
  )
  const relatedIconLoader = new DataLoader<string, GameAssetDbEntity>(
    async (ids) => {
      const assets = await (
        await this.db()
      )
        .collection<GameAssetDbEntity>('assets')
        .find({ relatedId: { $in: ids }, typeKey: 'icon' })
        .toArray()

      const assetsById = groupBy(assets, 'relatedId')

      return ids.map((id) => assetsById[id]?.[0] ?? null)
    },
  )

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getByRelation(
      this: DomainApi,
      relatedId: string,
      typeKey: GameAssetType,
    ) {
      if (typeKey === 'cover') {
        return relatedCoverLoader.load(relatedId)
      } else if (typeKey === 'icon') {
        return relatedIconLoader.load(relatedId)
      }

      throw new Error(`Unsupported typeKey: ${typeKey}`)
    },
  })
}

export default create
