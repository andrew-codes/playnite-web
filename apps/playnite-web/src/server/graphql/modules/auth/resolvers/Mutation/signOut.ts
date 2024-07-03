import _ from 'lodash'
import { nullUser } from '../../../user/api/NullUser'
import type { MutationResolvers } from './../../../../types.generated'

const { omit } = _
export const signOut: NonNullable<MutationResolvers['signOut']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const claim = _ctx.jwt
  _ctx.request.cookieStore?.delete('authorization')

  return claim?.user ?? nullUser
}
