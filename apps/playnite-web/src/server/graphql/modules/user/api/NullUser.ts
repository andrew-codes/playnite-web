import * as oid from '../../../../oid'
import { User } from '../../../types.generated'

const nullUser: User = {
  id: oid.createNull('User').toString(),
  name: '',
  username: '',
  isAuthenticated: false,
}

export { nullUser }
