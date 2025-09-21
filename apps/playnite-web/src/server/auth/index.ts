import { Claim, User } from 'apps/playnite-web/.generated/types.generated.js'
import bcrypt from 'bcrypt'
import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import { merge, omit } from 'lodash-es'
import { prisma } from '../data/providers/postgres/client.js'
import logger from '../logger.js'
import { create, fromString, hasIdentity, IIdentify } from '../oid.js'

class IdentityService {
  constructor(
    private readonly _secret?: string,
    private readonly _issuer?: string,
  ) {}
  async authenticate(credential: UsernamePasswordCredential): Promise<Claim> {
    if (!this._secret) {
      logger.info('No secret provided for authentication.')
      throw new Error('Authentication failed.')
    }

    if (credential instanceof UsernamePasswordCredential) {
      const matchedUser = await prisma.user.findUnique({
        where: {
          username: credential.username,
        },
      })

      if (!matchedUser) {
        logger.error(
          `Authentication failed for user ${credential.username}: User not found.`,
        )
        throw new Error(
          `Authentication failed for user ${credential.username}.`,
        )
      }

      if (!bcrypt.compareSync(credential.password, matchedUser.password)) {
        logger.error(
          `Authentication failed for user ${credential.username}: Invalid password.`,
          matchedUser.password,
        )
        throw new Error(`Authentication failed.`)
      }

      const scrubbedUser: Omit<User, 'libraries' | 'settings'> = merge(
        {},
        omit(matchedUser, 'password'),
        {
          isAuthenticated: true,
          id: create('User', matchedUser.id).toString(),
        },
      )

      return {
        user: scrubbedUser,
        credential: jwt.sign(scrubbedUser, this._secret, {
          algorithm: 'HS256',
          issuer: this._issuer,
        }),
      } as Claim
    }

    logger.error('Invalid credential type provided for authentication.')
    throw new Error('Authentication failed.')
  }

  async authorize(
    user?: Omit<User, 'libraries'>,
  ): Promise<Omit<User, 'libraries' | 'id'> & { id: IIdentify }> {
    if (!user || !user.isAuthenticated) {
      throw new GraphQLError(
        `Authorization failed for user ${user?.username}`,
        {
          extensions: {
            code: 'UNAUTHORIZED',
            http: { status: 401 },
          },
        },
      )
    }

    const userId = fromString(user.id)
    if (!hasIdentity(userId)) {
      throw new GraphQLError(
        `Authorization failed for user ${user?.username}: Invalid user ID.`,
        {
          extensions: {
            code: 'UNAUTHORIZED',
            http: { status: 401 },
          },
        },
      )
    }

    return merge({}, user, { id: userId })
  }
}

class UsernamePasswordCredential {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}

export { IdentityService, UsernamePasswordCredential, type Claim }
