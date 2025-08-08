import { LoaderFunction, LoaderFunctionArgs, redirect } from '@remix-run/node'
import jwt from 'jsonwebtoken'
import { User } from '../../../.generated/types.generated'
import { PermissionValue, userHasPermission } from '../../auth/permissions.js'

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

async function requireUser(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get('Cookie')
  const token = parseJwtFromCookie(cookieHeader)
  if (!token) {
    return null
  }

  return verifyJwt(token)
}

function injectUser(
  fn: (
    args: LoaderFunctionArgs,
    user: User | null,
  ) => ReturnType<LoaderFunction>,
): LoaderFunction {
  return async (args) => {
    const user = await requireUser(args.request)

    return fn(args, user)
  }
}

function requiresSameUser(fn?: LoaderFunction): LoaderFunction {
  return injectUser((args, user) => {
    if (!user || !user.isAuthenticated) {
      return redirect('/login')
    }

    if (args.params.username !== user.username) {
      throw new Response('Forbidden', { status: 403 })
    }

    return fn?.(args) ?? null
  })
}

function requiresAuthorization(
  permission: PermissionValue,
  fn?: LoaderFunction,
): LoaderFunction {
  return injectUser((args, user) => {
    if (!user || !user.isAuthenticated) {
      return redirect('/login')
    }

    if (!userHasPermission(user, permission)) {
      throw new Response('Forbidden', { status: 403 })
    }

    return fn?.(args) ?? null
  })
}

export { injectUser, requiresAuthorization, requiresSameUser }
