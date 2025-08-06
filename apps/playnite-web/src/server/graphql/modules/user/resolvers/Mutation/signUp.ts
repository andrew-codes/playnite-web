import { GraphQLError } from 'graphql'
import { hashPassword } from '../../../../../auth/hashPassword.js'
import { UsernamePasswordCredential } from '../../../../../auth/index.js'
import Permission from '../../../../../auth/permissions.js'
import logger from '../../../../../logger.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const signUp: NonNullable<MutationResolvers['signUp']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (
    !_arg.input?.username ||
    !_arg.input?.email ||
    !_arg.input?.name ||
    !_arg.input?.password
  ) {
    throw new GraphQLError('All fields are required.', {
      extensions: {
        code: 'BAD_USER_INPUT',
        http: { status: 400 },
      },
    })
  }

  if (_arg.input?.password !== _arg.input?.passwordConfirmation) {
    throw new GraphQLError('Passwords do not match.', {
      extensions: {
        code: 'BAD_USER_INPUT',
        http: { status: 400 },
      },
    })
  }

  try {
    let permission = Permission.Write
    if ((await _ctx.db.user.count()) > 0) {
      permission = Permission.SiteAdmin
    }
    const newUser = await _ctx.db.user.create({
      data: {
        username: _arg.input.username,
        email: _arg.input.email,
        name: _arg.input.name,
        password: hashPassword(_arg.input.password),
        permission: permission,
      },
    })

    const authenticatedUser = await _ctx.identityService.authenticate(
      new UsernamePasswordCredential(_arg.input.username, _arg.input.password),
    )

    return authenticatedUser
  } catch (error) {
    logger.error('Error creating and authorizing user.', error)
    throw new GraphQLError('Failed to create user.', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        http: { status: 500 },
      },
    })
  }
}
