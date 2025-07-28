import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { isEmpty, merge, omit } from 'lodash-es'
import { prisma } from '../data/providers/postgres/client.js'
import { User } from '../data/types.entities.js'
import { create } from '../oid.js'

type Claim = {
  user: Omit<User, 'password'> & { isAuthenticated: boolean }
  credential: string
}
class IdentityService {
  constructor(
    private readonly _secret?: string,
    private readonly _issuer?: string,
  ) {}
  async authenticate(credential: UsernamePasswordCredential): Promise<Claim> {
    if (!this._secret) {
      throw new Error('Authentication failed')
    }

    if (credential instanceof UsernamePasswordCredential) {
      const matchedUsers = await prisma.user.findMany({
        where: {
          username: credential.username,
        },
      })

      if (!matchedUsers || isEmpty(matchedUsers)) {
        throw new Error(
          `Authentication failed for user ${credential.username}.`,
        )
      }

      const [user] = matchedUsers
      if (!bcrypt.compareSync(credential.password, user.password)) {
        throw new Error(`Authentication failed.`)
      }

      const scrubbedUser: User = merge({}, omit(user, 'password', 'id'), {
        isAuthenticated: true,
        id: create('User', user.id).toString(),
      })

      return {
        user: scrubbedUser,
        credential: jwt.sign(scrubbedUser, this._secret, {
          algorithm: 'HS256',
          issuer: this._issuer,
        }),
      } as Claim
    }
    throw new Error('Authentication failed.')
  }

  async authorize(user?: User): Promise<void> {
    if (!user || !user.isAuthenticated) {
      throw new Error(`Authorization failed for user ${user?.username}`)
    }
  }
}

class UsernamePasswordCredential {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}

export { IdentityService, UsernamePasswordCredential, type Claim }
