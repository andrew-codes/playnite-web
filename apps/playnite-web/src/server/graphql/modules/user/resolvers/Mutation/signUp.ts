import { GraphQLError } from 'graphql'
import Permission from '../../../../../../auth/permissions.js'
import { hashPassword } from '../../../../../auth/hashPassword.js'
import { UsernamePasswordCredential } from '../../../../../auth/index.js'
import { defaultSettings } from '../../../../../siteSettings.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const signUp: NonNullable<MutationResolvers['signUp']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (
    (await _ctx.db.user.count()) > 1 &&
    (
      await _ctx.db.siteSettings.findUnique({
        where: { id: defaultSettings.allowAnonymousAccountCreation.id },
      })
    )?.value !== 'true'
  ) {
    throw new GraphQLError('Anonymous account creation is not allowed.', {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    })
  }

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

  if (!/^[a-zA-Z0-9-]+$/.test(_arg.input.username)) {
    throw new GraphQLError(
      'Username must use alphanumeric and "-" characters only.',
      {
        extensions: {
          code: 'BAD_USER_INPUT',
          http: { status: 400 },
        },
      },
    )
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
  } catch (error: any) {
    if (error?.meta?.target) {
      const target = error.meta.target as string
      if (target.includes('username')) {
        throw new GraphQLError('Username is already taken.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            http: { status: 400 },
          },
        })
      }
      if (target.includes('email')) {
        throw new GraphQLError('Email is already in use.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            http: { status: 400 },
          },
        })
      }
    }
    throw error
  }
}
