import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated'
import { tryParseOid } from '../../../../../oid'

export const signOut: NonNullable<MutationResolvers['signOut']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const claim = _ctx.jwt?.payload
  if (!claim) {
    throw new GraphQLError('Not authenticated')
  }

  _ctx.request.cookieStore?.delete('authorization')
  claim.isAuthenticated = false

  const userId = tryParseOid(claim.id)

  return _ctx.db.user.findUniqueOrThrow({
    where: { id: userId.id },
  })
}
