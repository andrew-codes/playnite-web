import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import { getUserByLogin } from '../../../user/api/getUser'
import type { MutationResolvers } from './../../../../types.generated'

export const signIn: NonNullable<MutationResolvers['signIn']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (!_arg.input?.username || !_arg.input?.password) {
    throw new GraphQLError('Missing username or password')
  }
  const user = getUserByLogin(_arg.input.username, _arg.input.password)
  if (!user.isAuthenticated) {
    throw new GraphQLError('Invalid username or password')
  }
  const token = jwt.sign(user, _ctx.signingKey, {
    issuer: 'http://localhost',
    algorithm: 'HS256',
  })
  _ctx.request.cookieStore?.set({
    name: 'authorization',
    sameSite: 'strict',
    secure: true,
    domain: _ctx.domain,
    expires: _arg.input.rememberMe
      ? null
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    value: `Bearer ${token}`,
    httpOnly: true,
  })

  return user
}
