import { GraphQLError } from 'graphql'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { fromString, hasIdentity, IIdentify } from '../../../../../oid.js'

export const library: NonNullable<QueryResolvers['library']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (!hasIdentity(_arg.libraryId)) {
    throw new GraphQLError('Invalid library ID', {
      extensions: {
        code: 'BAD_USER_INPUT',
        entity: _arg.libraryId,
      },
    })
  }

  return _ctx.db.library.findFirst({
    where: {
      id: (fromString(_arg.libraryId) as IIdentify).id,
    },
  })
}
