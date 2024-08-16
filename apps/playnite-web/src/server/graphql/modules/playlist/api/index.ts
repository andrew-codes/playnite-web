import DataLoader from 'dataloader'
import _ from 'lodash'
import { TagDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { TagEntity } from '../../../resolverTypes'

const { keyBy, merge, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, TagEntity>(async (ids) => {
    const results = keyBy(
      (
        await (
          await this.db()
        )
          .collection<TagDbEntity>('tag')
          .find({ id: { $in: ids } })
          .toArray()
      ).map((item) =>
        merge({}, omit(item, '_id'), {
          name: item.name.replace(/playlist-/i, ''),
        }),
      ),
      'id',
    )

    return ids.map((id) =>
      results[id] ? omit(results[id], '_id') : null,
    ) as Array<TagEntity>
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
