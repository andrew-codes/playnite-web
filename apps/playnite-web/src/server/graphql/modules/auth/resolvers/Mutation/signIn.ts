import { GraphQLError } from 'graphql'
import { merge, omit } from 'lodash-es'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated.js'
import { UsernamePasswordCredential } from '../../../../../auth/index.js'
import { fromString, hasIdentity } from '../../../../../oid.js'

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

  const userId = fromString(claim.user.id)
  if (!hasIdentity(userId)) {
    throw new GraphQLError('Invalid OID format.', {
      extensions: { code: 'NOT_FOUND', http: { status: 404 } },
    })
  }
  const user = await _ctx.db.user.findUniqueOrThrow({
    where: { id: userId.id },
  })

  return merge({}, { user: omit(user, ['password']) }, claim)
}
