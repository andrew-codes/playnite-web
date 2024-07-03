import _ from 'lodash'
import type { MutationResolvers } from './../../../../types.generated'

const { omit } = _
export const signOut: NonNullable<MutationResolvers['signOut']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = _ctx.jwt
  _ctx.request.cookieStore?.delete('authorization')

  return omit(user, 'password')
}
