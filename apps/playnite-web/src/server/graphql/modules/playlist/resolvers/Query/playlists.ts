import { GraphQLError } from 'graphql'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { fromString, hasIdentity } from '../../../../../oid.js'

export const playlists: NonNullable<QueryResolvers['playlists']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const libraryOid = fromString(_arg.libraryId)
  if (!hasIdentity(libraryOid)) {
    throw new GraphQLError(`Invalid library ID: ${_arg.libraryId}`, {
      extensions: {
        code: 'INVALID_ID',
        argumentName: 'libraryId',
        id: _arg.libraryId,
      },
    })
  }

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
