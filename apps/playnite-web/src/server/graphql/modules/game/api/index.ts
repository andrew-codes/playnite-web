import DataLoader from 'dataloader'
import _ from 'lodash'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameEntity } from '../../../resolverTypes'

const { omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameEntity>(async (ids) => {
    const results = await (
      await this.db()
    )
      .collection<GameEntity>('consolidated-games')
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
      }) as Array<GameEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getBy(this: DomainApi, query: any) {
      return await (await this.db())
        .collection('consolidated-games')
        .find(query)
        .toArray()
    },
    async getAll(this: DomainApi) {
      return await (await this.db())
        .collection('consolidated-games')
        .find()
        .toArray()
    },
  })
}

export default create
