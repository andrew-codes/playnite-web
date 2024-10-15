import { Release } from '../../../../../data/types.entities'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const nowPlaying: NonNullable<QueryResolvers['nowPlaying']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const results = (await _ctx.queryApi.execute<Release>({
    entityType: 'Release',
    type: 'ExactMatch',
    field: 'runState',
    value: { id: 'running' },
  })) as Array<Release>

  return results?.[0]
}
