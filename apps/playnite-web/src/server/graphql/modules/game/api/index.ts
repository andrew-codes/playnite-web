import DataLoader from 'dataloader'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameEntity } from '../../../resolverTypes'

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameEntity>(async (ids) => {
    return await (
      await this.db()
    )
      .collection<GameEntity>('consolidated-games')
      .find({ id: { $in: ids } })
      .toArray()
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
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
