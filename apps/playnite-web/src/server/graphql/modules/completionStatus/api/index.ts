import DataLoader from 'dataloader'
import { omit } from 'lodash'
import { autoBind, type DomainApi } from '../../../Domain'
import { GameReleaseDbEntity } from '../../../data/types'
import { CompletionStatusEntity } from '../../../resolverTypes'

function create(this: DomainApi) {
  const loader = new DataLoader<string, CompletionStatusEntity>(async (ids) => {
    const items = await (
      await this.db()
    )
      .collection<GameReleaseDbEntity>('completionstatus')
      .find({ id: { $in: ids } })
      .toArray()

    return items.map((item) =>
      omit(item, ['_id']),
    ) as Array<CompletionStatusEntity>
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
  })
}

export default create
