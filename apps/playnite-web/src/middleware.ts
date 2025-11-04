import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { PermissionValue } from './feature/authorization/permissions'
import protectedRoutes from './protectedRoutes'
import { createNull, fromString, hasIdentity, Identity } from './server/oid'

// Simulated user session (in practice, fetch from auth provider)
const getSession = (
  request: NextRequest,
): {
  user: { id: Identity; username: string | null; permission: PermissionValue }
} => {
  const authCookie = request.cookies.get('authorization')?.value ?? null
  if (authCookie) {
    const cookieUser = jwt.decode(authCookie)
    if (cookieUser) {
      return {
        user: {
          id: fromString(cookieUser['id'] as string) as Identity,
          username: cookieUser['username'] as string,
          permission: cookieUser['permission'] as PermissionValue,
        } as { id: Identity; username: string; permission: PermissionValue },
      }
    }
  }

  return {
    user: {
      id: createNull('User'),
      username: null,
      permission: PermissionValue.None,
    },
  }
}

async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files
  if (/\.[^/]+$/.test(pathname)) {
    return NextResponse.next()
  }

  // Use localhost for internal API calls to avoid issues with external URLs in K8s
  const baseUrl =
    process.env.NEXT_PUBLIC_INTERNAL_API_URL ||
    `http://localhost:${process.env.PORT || 3000}`

  try {
    const siteSettingsResponse = await fetch(new URL('/api', baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: `query AccountSetupStatus {
        accountSetupStatus {
          isSetup
          allowAnonymousAccountCreation
          }
          }`,
      }),
    })
    const siteSettingsResult = await siteSettingsResponse.json()

    const session = getSession(request)
    const userAuthenticated = hasIdentity(session.user.id)

    if (pathname === '/account/new') {
      if (userAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      if (
        siteSettingsResult.data.accountSetupStatus.isSetup &&
        !siteSettingsResult.data.accountSetupStatus
          .allowAnonymousAccountCreation
      ) {
        return NextResponse.rewrite(new URL('/forbidden', request.url), {
          status: 403,
        })
      }

      return NextResponse.next()
    }

    for (const [match, hasPermission] of protectedRoutes) {
      if (match(request)) {
        if (!userAuthenticated) {
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('returnTo', request.nextUrl.pathname)
          return NextResponse.redirect(loginUrl)
        }

        if (!hasPermission(session.user, request)) {
          return NextResponse.rewrite(new URL('/forbidden', request.url), {
            status: 403,
          })
        }
      }
    }

    if (pathname === '/login' && userAuthenticated) {
      return NextResponse.redirect(
        new URL(`/u/${session.user.username}`, request.url),
      )
    }

    if (!siteSettingsResult.data.accountSetupStatus.isSetup) {
      return NextResponse.redirect(new URL('/account/new', request.url))
    }

    if (pathname === '/') {
      const setupStatus = siteSettingsResult.data.accountSetupStatus

      if (setupStatus.isSetup && !setupStatus.allowAnonymousAccountCreation) {
        const usersResponse = await fetch(new URL('/api', baseUrl), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query: `query Users($page: Int, $perPage: Int) {
            users(page: $page, perPage: $perPage) {
              userCount
              users {
                username
                libraries {
                  id
                }
              }
            }
          }`,
            variables: {
              page: 1,
              perPage: 1,
            },
          }),
        })

        const usersResult = await usersResponse.json()
        const { userCount, users } = usersResult.data.users

        if (userCount === 1 && users.length === 1) {
          const user = users[0]
          const libraryCount = user.libraries?.length || 0

          if (libraryCount === 1) {
            return NextResponse.rewrite(
              new URL(
                `/u/${user.username}/${user.libraries[0].id}`,
                request.url,
              ),
            )
          } else if (libraryCount > 1) {
            return NextResponse.rewrite(
              new URL(`/u/${user.username}`, request.url),
            )
          }
        }
      }
    }
  } catch (error) {
    console.error('Middleware error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  return NextResponse.next()
}

// const config = {
//   matcher: ['/((?!_next|api|favicon.ico|sitemap.xml|robots.txt).*)'],
//   runtime: 'nodejs', // Use Node.js runtime instead of Edge Runtime for custom server compatibility
// }

export { middleware }
