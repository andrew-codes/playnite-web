import DataLoader from 'dataloader'
import _ from 'lodash'
import { TagDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { TagEntity } from '../../../resolverTypes'

const { merge, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, TagEntity>(async (ids) => {
    const results = await (
      await this.db()
    )
      .collection<TagDbEntity>('tag')
      .find({ id: { $in: ids } })
      .toArray()

    return results
      .map((item) =>
        merge({}, omit(item, '_id'), {
          name: item.name.replace(/playlist-/i, ''),
        }),
      )
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
      const tags = await (
        await this.db()
      )
        .collection<TagEntity>('tag')
        .find({ name: { $regex: /^playlist-/i } })
        .toArray()

      return tags.map((item) =>
        merge({}, omit(item, '_id'), {
          name: item.name.replace(/playlist-/i, ''),
        }),
      )
    },
  })
}

export default create
