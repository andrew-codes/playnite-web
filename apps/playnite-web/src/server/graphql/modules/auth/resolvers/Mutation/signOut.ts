import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated.js'
import { fromString, hasIdentity } from '../../../../../oid.js'

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

  const userId = fromString(claim.id)
  if (!hasIdentity(userId)) {
    throw new GraphQLError('Invalid OID format.', {
      extensions: { code: 'NOT_FOUND', http: { status: 404 } },
    })
  }

  return _ctx.db.user.findUniqueOrThrow({
    where: { id: userId.id },
  })
}
