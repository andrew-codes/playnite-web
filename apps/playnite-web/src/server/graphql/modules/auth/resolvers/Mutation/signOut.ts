import type { MutationResolvers } from '../../../../../../../.generated/types.generated.js'

export const signOut: NonNullable<MutationResolvers['signOut']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const claim = _ctx.jwt
  if (!claim) {
    const gqlImport = await import('graphql')
    throw new gqlImport.GraphQLError('Not authenticated')
  }

  _ctx.request.cookieStore?.delete('authorization')

  return claim
}
