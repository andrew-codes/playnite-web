import { GraphQLError } from 'graphql'
import * as oid from '../../../../oid'
import { autoBind, type DomainApi } from '../../../Domain'
import { User } from '../../../types.generated'

function create(this: DomainApi) {
  return {
    ...autoBind(this, { authenticate }),
  }
}

let loadedPasswords = false
const passwordStore: Record<string, string> = {}

const loadPasswords = () => {
  const { PASSWORD } = process.env
  if (PASSWORD && !loadedPasswords) {
    passwordStore[oid.create('User', '1').toString()] = PASSWORD
    loadedPasswords = true
  }
}

function authenticate(
  this: DomainApi,
  user: User & { password: string },
): void {
  loadPasswords()
  const isAuthenticated = passwordStore[user.id] === user.password
  if (!isAuthenticated) {
    throw new GraphQLError(
      'Failed to authenticate. Invalid username or password',
    )
  }
}

export default create
