import { GraphQLError } from 'graphql'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated'

export const libraries: NonNullable<QueryResolvers['libraries']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = await _ctx.db.user.findUnique({
    where: {
      username: _arg.username,
    },
    select: {
      id: true,
    },
  })

  if (!user?.id) {
    throw new GraphQLError('User not found', {
      extensions: {
        code: 'NOT_FOUND',
        entity: _arg.username,
      },
    })
  }

  return _ctx.db.library.findMany({
    where: {
      userId: user.id,
    },
  })
}
