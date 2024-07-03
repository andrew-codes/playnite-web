import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import * as oid from '../../../../oid'
import { autoBind, type DomainApi } from '../../../Domain'
import { Claim, User } from '../../../types.generated'

function create(this: DomainApi) {
  const passwordStore: Record<string, string> = {}
  const { PASSWORD } = process.env
  if (PASSWORD) {
    passwordStore[oid.create('User', '1').toString()] = PASSWORD
  }

  return {
    ...autoBind(this, {
      authenticate,
      getPasswordForUser(this: DomainApi, user: User) {
        return passwordStore[user.id] ?? null
      },
      async authorize(this: DomainApi, claim: Claim) {
        const password = jwt.decode(
          claim.credential,
          process.env.SECRET ?? 'secret',
        )
        const authenticatedUser = await this.auth.authenticate(
          new PasswordCredential(claim.user.username, password),
        )
        if (!authenticatedUser.user.isAuthenticated) {
          throw new GraphQLError(
            'User failed authorization, not authenticated.',
          )
        }
      },
    }),
  }
}

interface Credential {
  applyCredential(api: DomainApi): Promise<Claim | null>
}

class PasswordCredential implements Credential {
  constructor(
    private username: string,
    private password: string,
  ) {}

  async applyCredential(api: DomainApi) {
    const user = api.user.getUserByLogin(this.username)
    const password = api.auth.getPasswordForUser(user)
    if (!password || password !== this.password) {
      return null
    }

    user.isAuthenticated = true

    return {
      user,
      credential: jwt.sign(password, process.env.SECRET ?? 'secret'),
    }
  }
}

async function authenticate(
  this: DomainApi,
  credential: Credential,
): Promise<Claim> {
  const appliedCredential = await credential.applyCredential(this)
  if (!appliedCredential) {
    throw new GraphQLError(
      'Failed to authenticate. Invalid username or password',
    )
  }

  return appliedCredential
}

export default create
export { PasswordCredential }
export type { Credential }
