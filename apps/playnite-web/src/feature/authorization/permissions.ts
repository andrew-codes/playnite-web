import { User } from '../../../.generated/types.generated'

enum PermissionValue {
  None = 0,
  Read = 1 << 0, // 1
  Write = (1 << 1) | (1 << 0), // 3
  SiteAdmin = (1 << 0) | (1 << 1) | (1 << 5), //  35
}
const permissionNames = ['None', 'Read', 'Write', 'SiteAdmin'] as const
type PermissionNames = (typeof permissionNames)[number]
type PermissionsType = {
  [k in PermissionNames]: PermissionValue
}

const Permission: PermissionsType = {
  None: PermissionValue.None,
  Read: PermissionValue.Read,
  Write: PermissionValue.Write,
  SiteAdmin: PermissionValue.SiteAdmin,
}

const userHasPermission = (
  user: User | null | undefined,
  requiredPermission: PermissionValue,
) => {
  if (!user) {
    return false
  }
  return (user.permission & requiredPermission) === requiredPermission
}

export default Permission
export { permissionNames, PermissionValue, userHasPermission }
