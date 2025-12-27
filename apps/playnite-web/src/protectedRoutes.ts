import { NextRequest } from 'next/server'
import {
  PermissionValue,
  userHasPermission,
} from './feature/authorization/permissions'
import { hasIdentity, Identity } from './server/oid'

type ProtectedRoute = [
  (request: NextRequest) => boolean,
  (
    user: {
      id: Identity
      username: string | null
      permission: PermissionValue
    },
    request: NextRequest,
  ) => boolean,
]

const siteAdmin: ProtectedRoute = [
  (request) => request.nextUrl.pathname.startsWith('/admin'),
  (user) => userHasPermission(user, PermissionValue.SiteAdmin),
]

const userAccount: ProtectedRoute = [
  (request) =>
    request.nextUrl.pathname.startsWith('/u') &&
    request.nextUrl.pathname.includes('/account'),
  (user, request) =>
    hasIdentity(user.id) &&
    request.nextUrl.pathname.startsWith(`/u/${user.username}`),
]

const matchesSettings = /\/u\/[a-zA-Z0-9-_]+\/Library:[1-9][0-9]*\/settings/
const librarySettings: ProtectedRoute = [
  (request) =>
    matchesSettings.test(decodeURIComponent(request.nextUrl.pathname)),
  (user, request) => {
    if (!hasIdentity(user.id)) {
      return false
    }

    const decodedPathname = decodeURIComponent(request.nextUrl.pathname)
    const pathParts = decodedPathname.split('/')
    const username = pathParts[2]
    return decodedPathname.startsWith(`/u/${username}`) &&
      username === user.username
      ? true
      : false
  },
]

export default [
  siteAdmin,
  userAccount,
  librarySettings,
] as Array<ProtectedRoute>
