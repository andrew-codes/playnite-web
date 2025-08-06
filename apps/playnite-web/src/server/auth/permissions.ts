import { User } from '../../../.generated/types.generated'

enum PermissionValue {
  None = 0,
  Read = 1 << 0, // 1
  Write = 1 << 1, // 2
  SiteAdmin = Read | Write | (1 << 5), //   32
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

const userHasPermission = (user: User, requiredPermission: PermissionValue) => {
  return (user.permission & requiredPermission) === requiredPermission
}

export default Permission
export { permissionNames, userHasPermission }
