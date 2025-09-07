import Permission from '../authorization/permissions'
import { requiresPermission } from '../authorization/requiresPermission'

const requiresAuthorization = requiresPermission(Permission.SiteAdmin)

export { requiresAuthorization }
