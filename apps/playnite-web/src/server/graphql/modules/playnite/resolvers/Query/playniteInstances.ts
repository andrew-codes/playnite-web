import { GraphQLError } from 'graphql'
import { fromString, hasIdentity } from '../../../../../oid.js'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const playniteInstances: NonNullable<
  QueryResolvers['playniteInstances']
> = async (_parent, _arg, _ctx) => {
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

  return _ctx.db.playniteLibrary.findMany({
    where: {
      Library: {
        id: oid.id,
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}
