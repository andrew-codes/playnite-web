import jwt from 'jsonwebtoken'
import _ from 'lodash'
import { IQuery } from '../data/types.api'
import { User } from '../data/types.entities'

const { isEmpty } = _

type Claim = {
  user: Omit<User, 'password'> & { isAuthenticated: boolean }
  credential: string
}
class IdentityService {
  constructor(
    private _queryApi: IQuery,
    private readonly _secret?: string,
    private readonly _issuer?: string,
  ) {}
  async authenticate(credential: UsernamePasswordCredential): Promise<Claim> {
    if (!this._secret) {
      throw new Error('Authentication failed')
    }

    if (credential instanceof UsernamePasswordCredential) {
      const matchedUsers = await this._queryApi.execute<User>({
        type: 'AndMatch',
        entityType: 'User',
        filterItems: [
          {
            type: 'ExactMatch',
            entityType: 'User',
            field: 'username',
            value: credential.username,
          },
          {
            type: 'ExactMatch',
            entityType: 'User',
            field: 'password',
            value: credential.password,
          },
        ],
      })

      if (!matchedUsers || isEmpty(matchedUsers)) {
        throw new Error(`Authentication failed for user ${credential.username}`)
      }

      const [user] = matchedUsers
      user.isAuthenticated = true

      return {
        user: {
          _type: 'User',
          id: user.id,
          username: user.username,
          isAuthenticated: true,
        },
        credential: jwt.sign(user, this._secret, {
          algorithm: 'HS256',
          issuer: this._issuer,
        }),
      } as Claim
    }
    throw new Error('Authentication failed')
  }

  async authorize(user?: User): Promise<void> {
    if (!user || !user.isAuthenticated) {
      throw new Error(`Authentication failed for user ${user?.username}`)
    }
  }
}

class UsernamePasswordCredential {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}

export { IdentityService, UsernamePasswordCredential }
