import createDebugger from 'debug'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { sessionStorage } from './session.server'

const { USERNAME, PASSWORD } = process.env
const debug = createDebugger('playnite-web-app/auth.server')

const authenticator = new Authenticator<{
  username: string
  shouldRememberMe: boolean
}>(sessionStorage)

authenticator.use(
  new FormStrategy(async ({ form }) => {
    if (USERNAME === undefined || PASSWORD === undefined) {
      debug(
        'Features requiring authentication are disabled. Try setting the USERNAME and PASSWORD environment variables to enable these features.',
      )
      throw new Error('Missing credentials')
    }

    let username = form.get('username')
    let password = form.get('password')
    if (USERNAME !== username || PASSWORD !== password) {
      debug('Invalid credentials', { username, password })
      throw new Error('Invalid credentials')
    }

    return { username, shouldRememberMe: form.get('rememberMe') === 'on' }
  }),
  'user-pass',
)

export { authenticator }
