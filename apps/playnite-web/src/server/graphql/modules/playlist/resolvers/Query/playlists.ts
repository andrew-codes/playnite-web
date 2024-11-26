import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { Playlist } from '../../../../../data/types.entities.js'

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
