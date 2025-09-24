import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { tryParseOid } from '../../../../../oid'

export const playlists: NonNullable<QueryResolvers['playlists']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const libraryOid = tryParseOid(_arg.libraryId)
  const playlists = await _ctx.db.playlist.findMany({
    where: {
      libraryId: libraryOid.id,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return playlists
}
