import DataLoader from 'dataloader'
import _ from 'lodash'
import { DomainApi, autoBind } from '../../../Domain'
import { TagEntity } from '../../../resolverTypes'

const { keyBy } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, TagEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<TagEntity>('tag')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map((id) => results[id] ?? null) as Array<TagEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      return (await this.db()).collection<TagEntity>('tag').find().toArray()
    },
  })
}

export default create
