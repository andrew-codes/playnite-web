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

const getUserByLogin = (username, password): User => {
  const { USERNAME, PASSWORD } = process.env
  if (!USERNAME || !PASSWORD) {
    throw new Error('Missing USERNAME or PASSWORD environment variable')
  }

  if (username === USERNAME && password === PASSWORD) {
    return { id: create('User', '1'), name: USERNAME, isAuthenticated: true }
  }

  return nullUser
}

export { getUserByLogin, User }
