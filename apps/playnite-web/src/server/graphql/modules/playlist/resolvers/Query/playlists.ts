import type { QueryResolvers } from '../../../../../../../.generated/types.generated'

export const playlists: NonNullable<QueryResolvers['playlists']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return (await _ctx.api.playlist.getAll()) ?? []
}
