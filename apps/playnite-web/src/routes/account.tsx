import { LoaderFunction } from '@remix-run/node'

const loader: LoaderFunction = async (args) => {
  return null
}

const Account = () => {
  return null
}

type SearchParams = { returnTo?: string }

export default Account
export { loader }
export type { SearchParams }
