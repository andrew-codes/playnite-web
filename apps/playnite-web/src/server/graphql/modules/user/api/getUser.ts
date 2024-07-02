import { merge } from 'lodash'
import { create, createNull, fromString } from '../../../../oid'
import { User } from '../../../types.generated'

const nullUser: User = {
  id: createNull('User').toString(),
  name: '',
  isAuthenticated: false,
}
let loadedUser = false
const userStore: Record<string, User> = {}
const passwordStore: Record<string, string> = {}

const loadUsers = () => {
  const { USERNAME, PASSWORD } = process.env
  if (USERNAME && PASSWORD && !loadedUser) {
    const user: User = {
      id: create('User', '1').toString(),
      name: USERNAME,
      isAuthenticated: true,
    }
    userStore[user.id.toString()] = user
    passwordStore[user.id.toString()] = PASSWORD
    loadedUser
  }
}

const getUserByLogin = (username: string, password: string): User => {
  loadUsers()
  const users = Object.values(userStore ?? {})
  const user = users.find((user) => user.name === username)
  if (!user) {
    return nullUser
  }
  if (passwordStore[user.id.toString()] !== password) {
    return nullUser
  }

  return merge({}, user, { isAuthenticated: true })
}
const getUserById = (id: string): User => {
  loadUsers()
  const users = Object.values(userStore ?? {})

  return users.find((user) => fromString(user.id).isEqual(id)) ?? nullUser
}

export { getUserById, getUserByLogin }
