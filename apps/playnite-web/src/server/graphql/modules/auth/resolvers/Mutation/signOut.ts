import type { MutationResolvers } from './../../../../types.generated'
export const signOut: NonNullable<MutationResolvers['signOut']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = _ctx.jwt
  _ctx.request.cookieStore?.delete('authorization')

  return user
}
