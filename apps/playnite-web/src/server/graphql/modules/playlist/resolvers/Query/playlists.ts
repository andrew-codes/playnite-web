import type { QueryResolvers } from './../../../../types.generated'

export const playlists: NonNullable<QueryResolvers['playlists']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const tags = await _ctx.api.tag.getAll()
  return tags.filter((tag) => tag.name.startsWith('playlist-')) || []
}
