import DataLoader from 'dataloader'
import _ from 'lodash'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameEntity } from '../../../resolverTypes'

const { keyBy, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<GameEntity>('consolidated-games')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map((id) =>
      results[id] ? omit(results[id], '_id') : null,
    ) as Array<GameEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getBy(this: DomainApi, query: any) {
      return await (await this.db())
        .collection<GameEntity>('consolidated-games')
        .find(query)
        .toArray()
    },
    async getAll(this: DomainApi) {
      return await (await this.db())
        .collection<GameEntity>('consolidated-games')
        .find()
        .toArray()
    },
  })
}

export default create
