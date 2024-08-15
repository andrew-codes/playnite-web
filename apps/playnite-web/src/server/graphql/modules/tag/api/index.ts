import DataLoader from 'dataloader'
import _ from 'lodash'
import { DomainApi, autoBind } from '../../../Domain'
import { TagEntity } from '../../../resolverTypes'

const { omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, TagEntity>(async (ids) => {
    const results = await (
      await this.db()
    )
      .collection<TagEntity>('tag')
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
      }) as Array<TagEntity>
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
