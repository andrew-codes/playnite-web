import { debug } from 'console'
import { merge } from 'lodash'
import { create, createNull, IIdentify } from '../oid'

type User = {
  id: IIdentify
  name: string
  isAuthenticated: boolean
}
const nullUser = {
  id: createNull('User'),
  name: '',
  isAuthenticated: false,
}
const { USERNAME } = process.env
const user = {
  id: create('User', '1'),
  name: USERNAME ?? '',
  isAuthenticated: true,
}
const userStore = {
  [user.id.toString()]: user,
}
const passwordStore = {
  [user.id.toString()]: process.env.PASSWORD,
}

const getUserByLogin = (username: string, password: string): User => {
  const { USERNAME, PASSWORD } = process.env
  if (!USERNAME || !PASSWORD) {
    throw new Error('Missing USERNAME or PASSWORD environment variable')
  }

  debug(userStore)
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
const getUserById = (id: IIdentify | string): User => {
  const users = Object.values(userStore ?? {})
  const oid = typeof id === 'string' ? create('User', id) : id

  return users.find((user) => user.id.isEqual(oid)) ?? nullUser
}

export { getUserById, getUserByLogin }
export type { User }
