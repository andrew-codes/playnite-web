import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { Playlist } from '../../../../../data/types.entities'

export const playlists: NonNullable<QueryResolvers['playlists']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const results = await _ctx.queryApi.execute<Playlist>({
    entityType: 'Playlist',
    type: 'MatchAll',
  })

  return results ?? []
}
