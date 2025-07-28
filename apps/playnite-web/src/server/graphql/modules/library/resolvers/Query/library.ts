import { GraphQLError } from 'graphql'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { fromString, hasIdentity } from '../../../../../oid.js'

export const library: NonNullable<QueryResolvers['library']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = fromString(_arg.userId)
  if (!hasIdentity(oid)) {
    throw new GraphQLError(`Invalid user ID: ${_arg.userId}`, {
      extensions: {
        code: 'INVALID_ID',
        argumentName: 'userId',
        id: _arg.userId,
      },
    })
  }

  return _ctx.db.library.findFirst({
    where: {
      userId: oid.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
