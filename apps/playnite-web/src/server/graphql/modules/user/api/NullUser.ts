import { User } from '../../../../../../.generated/types.generated'
import * as oid from '../../../../oid'

const nullUser: User = {
  id: oid.createNull('User').toString(),
  name: '',
  username: '',
  isAuthenticated: false,
}

export { nullUser }
