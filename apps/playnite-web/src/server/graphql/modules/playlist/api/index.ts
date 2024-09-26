import DataLoader from 'dataloader'
import _ from 'lodash'
import { PlaylistDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import { TagEntity } from '../../../resolverTypes'

const { keyBy, merge, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, TagEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<PlaylistDbEntity>('playlist')
        .find({ id: { $in: ids } })
        .toArray(),
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
      return (await this.db())
        .collection<PlaylistDbEntity>('playlist')
        .find()
        .toArray()
    },
  })
}

export default create
