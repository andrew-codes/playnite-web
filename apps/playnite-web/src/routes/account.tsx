import { LoaderFunction } from '@remix-run/node'
import { Outlet } from '@remix-run/react'

const loader: LoaderFunction = async (args) => {
  return null
}

const Account = () => {
  return <Outlet />
}

type SearchParams = { returnTo?: string }

export default Account
export { loader }
export type { SearchParams }
