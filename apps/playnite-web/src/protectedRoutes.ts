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

export default [siteAdmin, userAccount] as Array<ProtectedRoute>
