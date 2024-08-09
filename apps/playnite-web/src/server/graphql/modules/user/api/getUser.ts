import { User } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'
import { DomainApi } from '../../../Domain'
import { nullUser } from './NullUser'

let loadedUser = false
const userStore: Record<string, User> = {}

const loadUsers = () => {
  const { USERNAME, PASSWORD } = process.env
  if (USERNAME && PASSWORD && !loadedUser) {
    const user: User = {
      id: create('User', '1').toString(),
      name: USERNAME,
      username: USERNAME,
      isAuthenticated: false,
    }
    userStore[user.id.toString()] = user
    loadedUser = true
  }
}

function getUserByLogin(this: DomainApi, username: string): User {
  loadUsers()
  const users = Object.values(userStore ?? {})
  const user = users.find((user) => user.name === username)

  return user ?? nullUser
}
function getUserById(this: DomainApi, id: string): User {
  loadUsers()
  return userStore[id] ?? nullUser
}

export { getUserById, getUserByLogin }
