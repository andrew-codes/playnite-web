import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated'
import { UsernamePasswordCredential } from '../../../../../auth/index'

export const signIn: NonNullable<MutationResolvers['signIn']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (!_arg.input?.username || !_arg.input?.password) {
    throw new GraphQLError('Missing username or password')
  }
  try {
    const claim = await _ctx.identityService.authenticate(
      new UsernamePasswordCredential(_arg.input.username, _arg.input.password),
    )

    _ctx.request.cookieStore?.set({
      name: 'authorization',
      sameSite: 'strict',
      secure: true,
      domain: _ctx.domain,
      expires: _arg.input.rememberMe
        ? null
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      value: `Bearer ${claim.credential}`,
      httpOnly: true,
    })

    return claim
  } catch (error) {
    console.error(error)
    throw new GraphQLError('Authentication failed')
  }
}
