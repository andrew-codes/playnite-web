import createDebugger from 'debug'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { sessionStorage } from './session.server'

const { USERNAME, PASSWORD } = process.env
const debug = createDebugger('playnite-web-app/auth.server')

const authenticator = new Authenticator<{
  username: string
}>(sessionStorage)

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let username = form.get('username')
    let password = form.get('password')
    if (USERNAME !== username || PASSWORD !== password) {
      debug('Invalid credentials', { username, password })
      throw new Error('Invalid credentials')
    }

    return { username }
  }),
  'user-pass',
)

export { authenticator }
