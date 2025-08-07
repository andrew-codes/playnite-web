import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated.js'
import { UsernamePasswordCredential } from '../../../../../auth/index.js'

export const signIn: NonNullable<MutationResolvers['signIn']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (!_arg.input?.username || !_arg.input?.password) {
    throw new GraphQLError('Missing username or password', {
      extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
    })
  }
  const claim = await _ctx.identityService.authenticate(
    new UsernamePasswordCredential(_arg.input.username, _arg.input.password),
  )

  if (claim.user.id === null) {
    throw new GraphQLError('Authentication failed', {
      extensions: { code: 'AUTH_FAILED', http: { status: 401 } },
    })
  }

  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  _ctx.request.cookieStore?.set({
    name: 'authorization',
    sameSite: 'strict',
    secure: true,
    domain: _ctx.domain,
    expires: _arg.input.rememberMe ? expires : null,
    value: claim.credential,
    httpOnly: true,
  })

  return claim
}
