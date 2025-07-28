import { GraphQLError } from 'graphql'
import { fromString, hasIdentity } from '../../../../../oid.js'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const tag: NonNullable<QueryResolvers['tag']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = fromString(_arg.id)
  if (!hasIdentity(oid)) {
    throw new GraphQLError(`Invalid tag ID: ${_arg.id}`, {
      extensions: {
        code: 'INVALID_ID',
        argumentName: 'id',
        id: _arg.id,
      },
    })
  }

  return _ctx.db.tag.findUnique({
    where: {
      id: oid.id,
    },
  })
}
