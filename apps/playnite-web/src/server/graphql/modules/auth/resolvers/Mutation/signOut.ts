import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated'

export const signOut: NonNullable<MutationResolvers['signOut']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const claim = _ctx.jwt
  if (!claim) {
    throw new GraphQLError('Not authenticated')
  }

  _ctx.request.cookieStore?.delete('authorization')

  return claim.user
}
