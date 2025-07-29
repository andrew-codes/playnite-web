import { LoaderFunction, LoaderFunctionArgs } from '@remix-run/node'
import jwt from 'jsonwebtoken'
import { User } from '../data/types.entities'

function verifyJwt(token: string): User | null {
  if (!process.env.SECRET) {
    return null
  }

  try {
    return jwt.verify(token, process.env.SECRET) as User
  } catch {
    return null
  }
}

function parseJwtFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .map(([k, v]) => [k, decodeURIComponent(v)]),
  )

  return cookies['authorization'] ?? null
}

async function requireUser(
  request: Request,
  redirectTo: string = '/login',
): Promise<User | null> {
  const cookieHeader = request.headers.get('Cookie')
  const token = parseJwtFromCookie(cookieHeader)
  if (!token) {
    return null
  }

  return verifyJwt(token)
}

const injectUser: (
  fn: (
    args: LoaderFunctionArgs,
    user: User | null,
  ) => ReturnType<LoaderFunction>,
) => (args: LoaderFunctionArgs) => ReturnType<LoaderFunction> = (fn) => {
  return async (args) => {
    const user = await requireUser(args.request)

    return fn(args, user)
  }
}

const requiresAuthentication: (fn: LoaderFunction) => LoaderFunction = (fn) => {
  return injectUser((args, user) => {
    if (!user?.isAuthenticated) {
      return new Response('Unauthorized', { status: 401 })
    }

    return fn(args)
  })
}

export { injectUser, requiresAuthentication }
