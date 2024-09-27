import DataLoader from 'dataloader'
import _ from 'lodash'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameReleaseDbEntity } from '../../../data/types'
import { CompletionStatusEntity } from '../../../resolverTypes'

const { keyBy, omit } = _

function create(this: DomainApi) {
  const loader = new DataLoader<string, CompletionStatusEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<GameReleaseDbEntity>('completionstatus')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map((id) => results[id] ?? null) as Array<CompletionStatusEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      if (id === '00000000-0000-0000-0000-000000000000') {
        return {
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Unknown',
        }
      }

      return loader.load(id)
    },
    async getBy(this: DomainApi, query: any) {
      const items = await (await this.db())
        .collection<GameReleaseDbEntity>('completionstatus')
        .find(query)
        .toArray()

      return items as Array<CompletionStatusEntity>
    },
  })
}

export default create
