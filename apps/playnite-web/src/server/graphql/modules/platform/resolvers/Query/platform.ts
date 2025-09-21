import { GraphQLError } from 'graphql/error/index.js'
import { fromString, hasIdentity } from '../../../../../oid.js'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const platform: NonNullable<QueryResolvers['platform']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = fromString(_arg.id)
  if (!hasIdentity(oid)) {
    throw new GraphQLError(`Invalid platform ID: ${_arg.id}`, {
      extensions: {
        code: 'INVALID_ID',
        argumentName: 'id',
        id: _arg.id,
      },
    })
  }

  return _ctx.db.platform.findUnique({
    where: {
      id: oid.id,
    },
  })
}
