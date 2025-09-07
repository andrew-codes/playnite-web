import { GraphQLError } from 'graphql'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { fromString, hasIdentity } from '../../../../../oid.js'

const exactMatch = /(^".*"$)|(^'.*'$)/

export const games: NonNullable<QueryResolvers['games']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = fromString(_arg.libraryId)
  if (!hasIdentity(oid)) {
    throw new GraphQLError(`Invalid library ID: ${_arg.libraryId}`, {
      extensions: {
        code: 'INVALID_ID',
        argumentName: 'libraryId',
        id: _arg.libraryId,
      },
    })
  }

  return _ctx.db.game.findMany({
    where: {
      id: oid.id,
    },
  })
}
