import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import { PasswordCredential } from '../../api'
import type { MutationResolvers } from './../../../../types.generated'

export const signIn: NonNullable<MutationResolvers['signIn']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (!_arg.input?.username || !_arg.input?.password) {
    throw new GraphQLError('Missing username or password')
  }
  const authenticatedClaim = await _ctx.api.auth.authenticate(
    new PasswordCredential(_arg.input.username, _arg.input.password),
  )

  const token = jwt.sign(authenticatedClaim, _ctx.signingKey, {
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

  return authenticatedClaim
}
