import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

const Account = () => {
  return null
}

type SearchParams = { returnTo?: string }

export default Account
export { loader }
export type { SearchParams }
