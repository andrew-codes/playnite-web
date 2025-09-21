import { GraphQLError } from 'graphql'
import { fromString, hasIdentity } from '../../../../../oid.js'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const source: NonNullable<QueryResolvers['source']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = fromString(_arg.id)
  if (!hasIdentity(oid)) {
    throw new GraphQLError(`Invalid source ID: ${_arg.id}`, {
      extensions: {
        code: 'INVALID_ID',
        argumentName: 'id',
        id: _arg.id,
      },
    })
  }

  return _ctx.db.source.findUnique({
    where: {
      id: oid.id,
    },
  })
}
