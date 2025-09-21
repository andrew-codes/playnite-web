import { GraphQLError } from 'graphql'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { fromString, hasIdentity } from '../../../../../oid.js'

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = fromString(_arg.id)
  if (!hasIdentity(oid)) {
    throw new GraphQLError(`Invalid game ID: ${_arg.id}`, {
      extensions: {
        code: 'INVALID_ID',
        argumentName: 'id',
        id: _arg.id,
      },
    })
  }

  return _ctx.db.game.findUnique({
    where: {
      id: oid.id,
    },
  })
}
